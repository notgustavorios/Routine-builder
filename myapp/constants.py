# Scoring constants for gymnastics routines

EXERCISE_PRESENTATION = {
    1: 8.0,
    2: 8.0,
    3: 8.0,
    4: 8.0,
    5: 8.0,
    6: 8.0,
    7: 8.0,
    8: 8.0,
    9: 8.0,
    10: 7.5
}

SUPERSKILLS_ALLOWED = {
    1: 8,
    2: 8,
    3: 8,
    4: 6,
    5: 5,
    6: 4,
    7: 3,
    8: 2,
    9: 1,
    10: 0,
}

SHORT_ROUTINE = {
    9: 0.0,
    8: 0.0,
    7: 0.0,
    6: 0.0,
    5: 3.0,
    4: 4.0,
    3: 5.0,
    2: 6.0,
    1: 7.0,
    0: 10.0
}

REQUIRED_FIG = {
    1: 0,
    2: 0,
    3: 0,
    4: 1,
    5: 2,
    6: 3,
    7: 4,
    8: 4,
    9: 5,
    10: 6,
}

FIG_ALLOWED = {
    1: ['A'],
    2: ['A'],
    3: ['A'],
    4: ['A','B'],
    5: ['A','B'],
    6: ['A','B','C'],
    7: ['A','B','C'],
    8: ['A','B','C','D','E','F','G','H','I','J'],
    9: ['A','B','C','D','E','F','G','H','I','J'],
    10: ['A','B','C','D','E','F','G','H','I','J'],
}

FIG_VALUES = {
    'A': 0.1,
    'B': 0.2,
    'C': 0.3,
    'D': 0.4,
    'E': 0.5,
    'F': 0.6,
    'G': 0.7,
    'H': 0.8,
    'I': 0.9,
    'J': 1.0,
}

def get_max_difficulty_for_level(level):
    # For levels 8-10, use the maximum FIG value (1.0 for 'J' skills)
    if level >= 8:
        return 1.0
    
    # For other levels, use the existing FIG_ALLOWED logic
    allowed_figs = FIG_ALLOWED.get(level, [])
    if not allowed_figs:
        return 0.0
    max_fig = allowed_figs[-1]  # Get the highest allowed FIG value
    return FIG_VALUES.get(max_fig, 0.0)
