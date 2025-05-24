import json
import sys
import os
import time
import re

def log_to_stderr(message):
    print(message, file=sys.stderr, flush=True)

def apply_ai_changes_to_file(file_path, command_text):
    """
    This function applies AI changes to the specified file based on the given command.
    This is a simulation for now.
    """
    log_to_stderr(f"VM Script: Processing AI command '{command_text}' on file '{file_path}'...")
    
    if not os.path.exists(file_path) or not os.path.isfile(file_path):
        log_to_stderr(f"VM Script ERROR: File not found or invalid: {file_path}")
        sys.exit(10)

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content_for_check = content
        
        # Simulate AI changes based on command
        modified_by_ai = False
        if "navbar ekle" in command_text.lower():
            if "<body>" in content:
                navbar_html = """
<nav style="background-color: #333; color: white; padding: 10px;">
  <ul style="list-style-type: none; margin: 0; padding: 0; display: flex;">
    <li style="margin-right: 20px;"><a href="#" style="color: white; text-decoration: none;">Home</a></li>
    <li style="margin-right: 20px;"><a href="#" style="color: white; text-decoration: none;">About</a></li>
    <li><a href="#" style="color: white; text-decoration: none;">Contact</a></li>
  </ul>
</nav>
"""
                if "<nav" not in content.lower():
                    content = content.replace("<body>", "<body>" + navbar_html, 1)
                    modified_by_ai = True
                else:
                    log_to_stderr("VM Script: Navbar already exists, not adding.")
            else:
                content += "\n<!-- AI: Could not add navbar, body tag not found -->"
                log_to_stderr("VM Script: Could not find body tag, navbar not added.")
        elif "change title" in command_text.lower():
            try:
                new_title_match = re.search(r"change title[:\s]*(.+)", command_text, re.IGNORECASE)
                if new_title_match:
                    new_title = new_title_match.group(1).strip()
                    if new_title:
                        content, count_title = re.subn(r"<title>.*?</title>", f"<title>{new_title}</title>", content, 1, flags=re.IGNORECASE | re.DOTALL)
                        content, count_h1 = re.subn(r"<h1>.*?</h1>", f"<h1>{new_title}</h1>", content, 1, flags=re.IGNORECASE | re.DOTALL)
                        if count_title > 0 or count_h1 > 0:
                            modified_by_ai = True
                        else:
                            log_to_stderr("VM Script: Could not find <title> or <h1> tags.")
                    else:
                        log_to_stderr("VM Script: New title cannot be empty.")
                else:
                    log_to_stderr("VM Script: Invalid change title command format.")
            except Exception as e:
                log_to_stderr(f"VM Script: Error while changing title: {str(e)}")
                content += f"\n<!-- AI: Error changing title: {str(e)} -->"
        else:
            content += f"\n<!-- AI: Unknown command or command could not be applied: {command_text} -->"
            log_to_stderr(f"VM Script: Unknown command or could not be applied: {command_text}")

        time.sleep(0.5)  # Simulate AI processing time
        
        if modified_by_ai and content != original_content_for_check:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            log_to_stderr(f"VM Script: File '{file_path}' updated by AI.")
        elif modified_by_ai and content == original_content_for_check:
            log_to_stderr(f"VM Script: AI attempted changes but content remained the same. File not written: {file_path}")
        else:
            log_to_stderr(f"VM Script: File '{file_path}' was NOT modified by AI.")

        return

    except Exception as e:
        log_to_stderr(f"VM Script ERROR (apply_ai_changes_to_file): {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        test_file = "test_page.html"
        test_command = "navbar ekle"
        if len(sys.argv) > 2:
            test_command = sys.argv[2]

        with open(test_file, "w", encoding="utf-8") as f:
            f.write("<html><head><title>Test Page</title></head><body><h1>Hello World</h1></body></html>")
        log_to_stderr(f"VM Script TEST MODE: File '{test_file}', Command: '{test_command}'")
        try:
            apply_ai_changes_to_file(test_file, test_command)
            log_to_stderr("VM Script TEST MODE: apply_ai_changes_to_file completed.")
            with open(test_file, "r", encoding="utf-8") as f:
                log_to_stderr("VM Script TEST MODE: Updated file content:")
                log_to_stderr(f.read())
        finally:
            if os.path.exists(test_file):
                os.remove(test_file)
        sys.exit(0)

    input_str = ""
    try:
        input_str = sys.stdin.read()
        if not input_str.strip():
            log_to_stderr("VM Script ERROR: Empty input received from stdin.")
            sys.exit(2)

        input_data = json.loads(input_str)
        file_to_modify = input_data.get("file_path")
        ai_command = input_data.get("command")

        if not file_to_modify or not ai_command:
            log_to_stderr(f"VM Script ERROR: Missing parameters (file_path, command). Received: {input_data}")
            sys.exit(3)
        
        apply_ai_changes_to_file(file_to_modify, ai_command)
        
        log_to_stderr(f"VM Script: Successfully completed task for '{file_to_modify}'.")
        sys.exit(0)

    except json.JSONDecodeError:
        log_to_stderr(f"VM Script ERROR: Invalid JSON input. Received: '{input_str[:200]}...'")
        sys.exit(4)
    except SystemExit:
        raise
    except Exception as e:
        log_to_stderr(f"VM Script General ERROR (__main__): {str(e)}")
        sys.exit(5) 