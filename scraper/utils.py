from urllib.request import urlopen, Request
import urllib.error
import os
import threading
from pathlib import Path
import socket

"""
This script is for:
1. Cleaning up removing URLs which are invalid, lead to 404, timeout or other errors.
"""
#Total
all_urls = []
valid_urls = []
invalid_urls = []
http_errors = []
other_errors = []

# Current file
all_urls_file = []
valid_urls_file = []
invalid_urls_file = []
http_errors_file = []
other_errors_file = []

chunks = []

def clean_chunk(idx, chunk):
    for line in chunk:
        properties = line.split(',')
        url = properties[0]
        url_name = properties[1]
        list_url = properties[2]
        list_name = properties[3]

        is_invalid = False

        try:
            all_urls.append(url)
            all_urls_file.append(url)
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.3'}
            req = Request(url=url, headers=headers) 
            conn = urlopen(req, timeout=10)
        except urllib.error.HTTPError as e:
            is_invalid = True
            http_errors.append(url)
            http_errors_file.append(url)
            invalid_urls.append(line)
            invalid_urls_file.append(line + ' error: ' + repr(e) + ' | reason: ' + str(e.reason))
        except urllib.error.URLError as e:
            is_invalid = True
             # If the reason is handshake timeout - it's cause of slow internet...just ignore exception
            if (not bool([r for r in ['timed out', 'timeout', 'time out'] if r in repr(e)])):
                other_errors.append(url)
                other_errors_file.append(url)
                invalid_urls.append(line)
                invalid_urls_file.append(line + ' error: ' + repr(e) + ' | reason: ' + str(e.reason))
        except Exception as e:
            is_invalid = True
            other_errors.append(url)
            other_errors_file.append(url)
            invalid_urls.append(line)
            invalid_urls_file.append(line + ' error: ' + repr(e) + ' | reason: ')
        else:
            valid_urls.append(line)
            valid_urls_file.append(line)

        print("\rTotal urls: {}  Valid urls: {} Invalid urls: {}  HTTP errors: {}  Other errors: {}" \
              .format(len(all_urls), len(valid_urls), len(all_urls) - len(valid_urls), len(http_errors), len(other_errors)), end="")

def write_result(cleaned_path, broken_path, filename):
    global valid_urls
    global invalid_urls

    clean_urls_file = cleaned_path + '/' + filename
    broken_urls_file = broken_path + '/' + filename
    # 1. Write the valid URLs. 

    # Create directory if doesn't exist
    Path(clean_urls_file).parent.mkdir(parents=True, exist_ok=True)
    Path(broken_urls_file).parent.mkdir(parents=True, exist_ok=True)

    if (os.path.exists(clean_urls_file)):
        os.remove(clean_urls_file)

    with open (clean_urls_file, 'a') as f:
        f.write('\n'.join(valid_urls_file))

    # 2. Write the invalid URLs (for list maintainers attention)

    if (os.path.exists(broken_urls_file)):
        os.remove(broken_urls_file)

    with open (broken_urls_file, 'a') as f:
        f.write('\n'.join(invalid_urls_file))

def reset():
    global all_urls_file
    global valid_urls_file
    global invalid_urls_file
    global http_errors_file
    global other_errors_file
    global chunks
    all_urls_file = []
    valid_urls_file = []
    invalid_urls_file = []
    http_errors_file = []
    other_errors_file = []
    chunks = []

def strip_new_line(url):
    return url.replace('\n', '')

def valid_url(url):
    is_not_empty = url != None and len(url) > 0
    elements = url.split(',')
    # 0 - url, 1 - name, 2 - list url, 3 - list name
    not_allowed_strings = ['/oauth/']

    is_not_allowed = bool([n for n in not_allowed_strings if (n in url)])
    return is_not_empty and not is_not_allowed


if __name__ == "__main__":
    print("♽ Cleaning up URLs...\n\n")

    # loop through all the URL files
    path = '../extension/data/urls/awesome'
    cleaned_path = '../extension/data/urls/awesome-cleaned'
    broken_path = '../extension/data/broken-urls/awesome'

    files = sorted(os.listdir(path))
    for filename in range(len(files)):
        reset()
        with open(path + '/' + files[filename], 'r') as f:
            urls = f.readlines()
            # few_urls = urls[0:10] #TEMP, remove after
            stripped_new_lines = [strip_new_line(url) for url in urls if valid_url(url)]
            filtered_urls = [url for url in stripped_new_lines if valid_url(url)]
            chunks = [filtered_urls[x:x+10] for x in range(0, len(filtered_urls), 10)]
            threads = [threading.Thread(target=clean_chunk,args=(idx, chunk)) for idx, chunk in enumerate(chunks)]
            [t.start() for t in threads]
            [t.join() for t in threads]
            write_result(cleaned_path, broken_path, files[filename])

    print("\n\n✔️ Done!\n")
