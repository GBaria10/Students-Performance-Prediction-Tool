import time
import random
import string
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import Select

def get_random_string(length=8):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def run_test():
    print("Starting Selenium Test...")
    
    # Setup Chrome Driver
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service)
    driver.maximize_window()
    wait = WebDriverWait(driver, 15)
    short_wait = WebDriverWait(driver, 5)
    
    try:
        # 1. Open Frontend
        print("Opening Frontend...")
        driver.get("http://localhost:4173")
        time.sleep(2)
        
        # 2. Signup
        print("Navigating to Signup...")
        # Click "Sign Up" toggle button
        signup_toggle = driver.find_element(By.XPATH, "//button[contains(text(), 'Sign Up')]")
        signup_toggle.click()
        time.sleep(1)
        
        # Fill Signup Form
        print("Filling Signup Form...")
        random_email = f"test_{get_random_string()}@college.edu"
        print(f"Using email: {random_email}")
        
        driver.find_element(By.NAME, "name").send_keys("Test Faculty")
        driver.find_element(By.NAME, "email").send_keys(random_email)
        driver.find_element(By.NAME, "password").send_keys("password123")
        
        # Submit Signup
        submit_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Create account')]")
        submit_btn.click()
        
        # Wait for redirect to dashboard (or login success toast)
        print("Waiting for login/redirect...")
        wait.until(EC.url_contains("/dashboard"))
        print("Login Successful! Redirected to Dashboard.")
        time.sleep(2)
        
        # 3. Navigate to Prediction Form
        print("Navigating to Prediction Form from dashboard...")
        predict_cta = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//a[contains(., 'Predict a student')]"))
        )
        predict_cta.click()
        wait.until(EC.url_contains("/predict"))
        
        # 4. Fill Prediction Form
        print("Filling Prediction Form...")
        def fill_input(field_name, value):
            elem = wait.until(EC.presence_of_element_located((By.NAME, field_name)))
            elem.clear()
            elem.send_keys(value)

        fill_input("studentName", "Selenium Student")
        fill_input("enrollmentNumber", f"SEL{get_random_string(4).upper()}")
        fill_input("age", "20")

        Select(wait.until(EC.presence_of_element_located((By.NAME, "gender")))).select_by_value("female")
        Select(wait.until(EC.presence_of_element_located((By.NAME, "department")))).select_by_value("CSE")
        Select(wait.until(EC.presence_of_element_located((By.NAME, "parentEducationLevel")))).select_by_value("Graduate")
        Select(wait.until(EC.presence_of_element_located((By.NAME, "hasPartTimeJob")))).select_by_value("no")

        fill_input("midsem1Marks", "85")
        fill_input("midsem2Marks", "88")
        fill_input("comprehensiveExamMarks", "90")
        fill_input("attendancePercentage", "95")
        fill_input("studyHoursPerWeek", "10")
        fill_input("totalBacklogs", "0")
        fill_input("currentGPA", "8.5")
        
        # 5. Submit Prediction
        print("Submitting Prediction...")
        # Button text is "Generate prediction"
        predict_btn = short_wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Generate prediction')]"))
        )
        predict_btn.click()
        
        # 6. Verify Results
        print("Waiting for results...")
        WebDriverWait(driver, 30).until(
            EC.url_contains("/results")
        )
        print("Redirected to Results Page!")
        
        # Check for some result text
        print("Verifying results content...")
        WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.XPATH, "//p[contains(., 'Predicted CGPA')]"))
        )
        short_wait.until(
            EC.presence_of_element_located((By.XPATH, "//span[contains(., 'Risk:')]"))
        )
        print("TEST PASSED: Results displayed successfully.")
        
        time.sleep(5) # Keep open for a bit to see
        
    except Exception as e:
        print(f"TEST FAILED: {e}")
        driver.save_screenshot("test_failure.png")
        
        # Check for error toasts
        try:
            toasts = driver.find_elements(By.XPATH, "//li[contains(@data-type, 'error')]")
            for toast in toasts:
                print(f"ERROR TOAST FOUND: {toast.text}")
        except:
            pass

        print("Browser Console Logs:")
        for entry in driver.get_log('browser'):
            print(entry)
            
        print("Page Source (First 2000 chars):")
        print(driver.page_source[:2000])
            
        raise
    finally:
        print("Closing browser...")
        driver.quit()

if __name__ == "__main__":
    run_test()
