from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify, current_app
from flask_login import login_required, current_user
from myapp.models import db, Team, Player, Routine, PlayerActiveRoutine, Skill
from myapp.models.routine import routine_skills
from werkzeug.exceptions import NotFound, Forbidden
import inspect, os

team_bp = Blueprint('team', __name__)

@team_bp.route('/teams')
@login_required
def list_teams():
    """List all teams for the current user"""
    teams = Team.query.filter_by(user_id=current_user.id).all()
    return render_template('team/list.html', teams=teams)

@team_bp.route('/teams/new', methods=['GET', 'POST'])
@login_required
def create_team():
    """Create a new team"""
    if request.method == 'POST':
        name = request.form.get('name')
        description = request.form.get('description')
        
        if not name:
            flash('Team name is required', 'danger')
            return redirect(url_for('team.create_team'))
        
        team = Team(
            name=name,
            description=description,
            user_id=current_user.id
        )
        
        db.session.add(team)
        db.session.commit()
        
        flash('Team created successfully', 'success')
        return redirect(url_for('team.view_team', team_id=team.id))
    
    return render_template('team/create.html')

@team_bp.route('/teams/<int:team_id>')
@login_required
def view_team(team_id):
    """View a team and its players"""
    team = Team.query.get_or_404(team_id)
    
    # Check if user owns this team
    if team.user_id != current_user.id:
        raise Forbidden("You don't have permission to view this team")
    
    players = Player.query.filter_by(team_id=team_id).all()
    return render_template('team/view.html', team=team, players=players)

@team_bp.route('/teams/<int:team_id>/edit', methods=['GET', 'POST'])
@login_required
def edit_team(team_id):
    """Edit a team"""
    team = Team.query.get_or_404(team_id)
    
    # Check if user owns this team
    if team.user_id != current_user.id:
        raise Forbidden("You don't have permission to edit this team")
    
    if request.method == 'POST':
        name = request.form.get('name')
        description = request.form.get('description')
        
        if not name:
            flash('Team name is required', 'danger')
            return redirect(url_for('team.edit_team', team_id=team_id))
        
        team.name = name
        team.description = description
        
        db.session.commit()
        
        flash('Team updated successfully', 'success')
        return redirect(url_for('team.view_team', team_id=team_id))
    
    return render_template('team/edit.html', team=team)

@team_bp.route('/teams/<int:team_id>/delete', methods=['POST'])
@login_required
def delete_team(team_id):
    """Delete a team"""
    team = Team.query.get_or_404(team_id)
    
    # Check if user owns this team
    if team.user_id != current_user.id:
        raise Forbidden("You don't have permission to delete this team")
    
    db.session.delete(team)
    db.session.commit()
    
    flash('Team deleted successfully', 'success')
    return redirect(url_for('team.list_teams'))

# Player routes
@team_bp.route('/teams/<int:team_id>/players/new', methods=['GET', 'POST'])
@login_required
def add_player(team_id):
    """Add a player to a team"""
    team = Team.query.get_or_404(team_id)
    
    # Check if user owns this team
    if team.user_id != current_user.id:
        raise Forbidden("You don't have permission to add players to this team")
    
    if request.method == 'POST':
        name = request.form.get('name')
        birth_date = request.form.get('birth_date')
        
        if not name:
            flash('Player name is required', 'danger')
            return redirect(url_for('team.add_player', team_id=team_id))
        
        player = Player(
            name=name,
            birth_date=birth_date,
            team_id=team_id
        )
        
        db.session.add(player)
        db.session.commit()
        
        flash('Player added successfully', 'success')
        return redirect(url_for('team.view_team', team_id=team_id))
    
    return render_template('team/add_player.html', team=team)

@team_bp.route('/players/<int:player_id>')
@login_required
def view_player(player_id):
    """View a player's details"""
    player = Player.query.get_or_404(player_id)
    team = Team.query.get_or_404(player.team_id)
    
    # Check if user owns this team
    if team.user_id != current_user.id:
        raise Forbidden("You don't have permission to view this player")
    
    # Get player's routines
    routines = Routine.query.filter_by(player_id=player_id).all()
    
    # Get player's active routines
    active_routines = player.get_active_routines()
    
    return render_template('player/view.html', 
                          player=player, 
                          team=team, 
                          routines=routines, 
                          active_routines=active_routines)

@team_bp.route('/players/<int:player_id>/edit', methods=['GET', 'POST'])
@login_required
def edit_player(player_id):
    """Edit a player"""
    player = Player.query.get_or_404(player_id)
    team = Team.query.get_or_404(player.team_id)
    
    # Check if user owns this team
    if team.user_id != current_user.id:
        raise Forbidden("You don't have permission to edit this player")
    
    if request.method == 'POST':
        name = request.form.get('name')
        birth_date = request.form.get('birth_date')
        
        if not name:
            flash('Player name is required', 'danger')
            return redirect(url_for('team.edit_player', player_id=player_id))
        
        player.name = name
        player.birth_date = birth_date
        
        db.session.commit()
        
        flash('Player updated successfully', 'success')
        return redirect(url_for('team.view_player', player_id=player_id))
    
    return render_template('player/edit.html', player=player, team=team)

@team_bp.route('/players/<int:player_id>/delete', methods=['POST'])
@login_required
def delete_player(player_id):
    """Delete a player"""
    player = Player.query.get_or_404(player_id)
    team = Team.query.get_or_404(player.team_id)
    team_id = team.id
    
    # Check if user owns this team
    if team.user_id != current_user.id:
        raise Forbidden("You don't have permission to delete this player")
    
    db.session.delete(player)
    db.session.commit()
    
    flash('Player deleted successfully', 'success')
    return redirect(url_for('team.view_team', team_id=team_id))

@team_bp.route('/players/<int:player_id>/routines')
@login_required
def player_routines(player_id):
    """View all routines for a player"""
    player = Player.query.get_or_404(player_id)
    team = Team.query.get_or_404(player.team_id)
    
    # Check if user owns this team
    if team.user_id != current_user.id:
        raise Forbidden("You don't have permission to view this player's routines")
    
    # Get all user routines that could be assigned
    user_routines = Routine.query.filter_by(user_id=current_user.id, player_id=None).all()
    
    # Get player's assigned routines
    player_routines = Routine.query.filter_by(player_id=player_id).all()
    
    # Get active routines - ensure dictionary exists even if empty
    active_routines_list = player.get_active_routines()
    active_routines = {}
    if active_routines_list:
        active_routines = {ar.event_type: ar.routine_id for ar in active_routines_list}
    
    return render_template('player/routines.html', 
                          player=player, 
                          team=team, 
                          user_routines=user_routines, 
                          player_routines=player_routines,
                          active_routines=active_routines)

@team_bp.route('/players/<int:player_id>/routines/assign', methods=['POST'])
@login_required
def assign_routine(player_id):
    """Assign a routine to a player"""
    player = Player.query.get_or_404(player_id)
    team = Team.query.get_or_404(player.team_id)
    
    # Check if user owns this team
    if team.user_id != current_user.id:
        raise Forbidden("You don't have permission to assign routines to this player")
    
    routine_id = request.form.get('routine_id')
    if not routine_id:
        flash('Routine selection is required', 'danger')
        return redirect(url_for('team.player_routines', player_id=player_id))
    
    routine = Routine.query.get_or_404(routine_id)
    
    # Check if routine belongs to user
    if routine.user_id != current_user.id:
        raise Forbidden("You don't have permission to assign this routine")
    
    # Create a copy of the routine for the player
    new_routine = Routine(
        name=routine.name,
        level=routine.level,
        user_id=current_user.id,
        player_id=player_id,
        event_type=routine.event_type
    )
    
    db.session.add(new_routine)
    db.session.commit()
    
    # Copy skills from original routine
    for skill_assoc in db.session.query(routine_skills).filter_by(routine_id=routine.id).all():
        skill_id = skill_assoc.skill_id
        position = skill_assoc.position
        new_routine.add_skill(Skill.query.get(skill_id), position)
    
    flash('Routine assigned to player successfully', 'success')
    return redirect(url_for('team.player_routines', player_id=player_id))

@team_bp.route('/players/<int:player_id>/routines/<int:routine_id>/set-active', methods=['POST'])
@login_required
def set_active_routine(player_id, routine_id):
    """Set a routine as active for competition"""
    player = Player.query.get_or_404(player_id)
    team = Team.query.get_or_404(player.team_id)
    
    # Check if user owns this team
    if team.user_id != current_user.id:
        raise Forbidden("You don't have permission to modify this player's routines")
    
    routine = Routine.query.get_or_404(routine_id)
    
    # Check if routine belongs to this player
    if routine.player_id != player_id:
        raise Forbidden("This routine doesn't belong to this player")
    
    event_type = routine.event_type or request.form.get('event_type')
    if not event_type:
        flash('Event type is required', 'danger')
        return redirect(url_for('team.player_routines', player_id=player_id))
    
    # Set the routine as active
    player.set_active_routine(routine, event_type)
    
    flash(f'Active {event_type} routine set successfully', 'success')
    return redirect(url_for('team.player_routines', player_id=player_id))

@team_bp.route('/players/<int:player_id>/routines/<int:routine_id>/unset-active', methods=['POST'])
@login_required
def unset_active_routine(player_id, routine_id):
    """Unset a routine as active for competition"""
    player = Player.query.get_or_404(player_id)
    team = Team.query.get_or_404(player.team_id)
    
    # Check if user owns this team
    if team.user_id != current_user.id:
        raise Forbidden("You don't have permission to modify this player's routines")
    
    # Find the active routine entry
    active_routine = PlayerActiveRoutine.query.filter_by(
        player_id=player_id,
        routine_id=routine_id
    ).first_or_404()
    
    # Delete the active routine entry
    db.session.delete(active_routine)
    db.session.commit()
    
    flash('Active routine unset successfully', 'success')
    return redirect(url_for('team.player_routines', player_id=player_id)) 