from bs4 import BeautifulSoup

def extract_th_elements(html_file):
    with open(html_file, 'r') as file:
        soup = BeautifulSoup(file, 'html.parser')
        # Find all th elements with colspan="3"
        th_elements = soup.find_all('th', attrs={'colspan': '3'})
        
        print("Found th elements with colspan=3:")
        print("--------------------------------")
        for i, th in enumerate(th_elements, 1):
            print(f"{str(th)}")  # str(th) returns the complete HTML tag

if __name__ == "__main__":
    html_file = "myapp/templates/skills.html"
    extract_th_elements(html_file)