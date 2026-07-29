import os
import sys
from playwright.sync_api import sync_playwright

def run_cuj(page):
    # We can load the static HTML file directly using absolute path
    html_path = os.path.abspath("web/index.html")
    print(f"Loading {html_path}")
    page.goto(f"file://{html_path}")
    page.wait_for_timeout(1000)

    # Screenshot the initial direct-loaded HUD on top of the live video background
    page.screenshot(path="/home/jules/verification/screenshots/boot_screen.png")
    page.wait_for_timeout(1500)

    # Click the body or some element to interact and activate audio playback
    page.click("body")
    page.wait_for_timeout(1000)

    # Click rules tab
    rules_btn = page.locator("button[data-tab='rules']")
    rules_btn.click()
    page.wait_for_timeout(1500)
    page.screenshot(path="/home/jules/verification/screenshots/rules_tab.png")

    # Click features tab
    features_btn = page.locator("button[data-tab='features']")
    features_btn.click()
    page.wait_for_timeout(1500)
    page.screenshot(path="/home/jules/verification/screenshots/features_tab.png")

    # Click lore tab again
    lore_btn = page.locator("button[data-tab='lore']")
    lore_btn.click()

    # Wait for the loading simulation to get near 100%
    page.wait_for_timeout(4000)
    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos",
            viewport={"width": 1920, "height": 1080}
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
