import requests
import os
from netaddr import IPSet, IPNetwork

# List of ASN numbers to lookup
asn_numbers = ["AS32934", "AS13335"]

# Function to lookup ASN details
def lookup_asn(asn):
    url = f"https://prefixes-cors-proxy.cc.workers.dev/{asn}"
    response = requests.get(url)
    data = response.json()

    return data

# Generate routing commands
networks = IPSet()
for asn in asn_numbers:
    data = lookup_asn(asn)
    for prefix in data['data']['ipv4_prefixes']:
        networks.add(IPNetwork(prefix['prefix']))

# Merge overlapping prefixes
aggregated_networks = list(networks.iter_cidrs())

# Create the networks_js variable
networks_js = [str(network) for network in aggregated_networks]

# Create HTML content with JavaScript
html_content = """
<!DOCTYPE html>
<html>
<head>
    <title>Routing Commands</title>
    <style>
        .code-block {{ background-color: #f4f4f4; border: 1px solid #ddd; padding: 10px; margin: 10px 0; white-space: pre-wrap; }}
        .copy-button {{ margin-left: 10px; cursor: pointer; }}
    </style>
</head>
<body>
    <h1>Routing Commands</h1>
    <label for="route-ip">Enter Router IP:</label>
    <input type="text" id="route-ip" name="route-ip">
    <button onclick="generateCommands()">Generate Add Routes</button>
    <button onclick="generateDeleteCommands()">Generate Delete Routes</button>
    <h2>Add Routes</h2>
    <button class="copy-button" onclick="copyToClipboard('add-commands')">Copy to Clipboard</button>
    <div id="add-commands" class="code-block"></div>
    <h2>Delete Routes</h2>
    <button class="copy-button" onclick="copyToClipboard('delete-commands')">Copy to Clipboard</button>
    <div id="delete-commands" class="code-block"></div>
    <script>
        const networks = {networks_js};

        function generateCommands() {{
            const routeIp = document.getElementById('route-ip').value;
            const addCommands = networks.map(network => `sudo route -n add -net ${{network}} ${{routeIp}}`).join('\\n');
            const deleteCommands = networks.map(network => `sudo route -n delete -net ${{network}} ${{routeIp}}`).join('\\n');
            document.getElementById('add-commands').textContent = addCommands;
            document.getElementById('delete-commands').textContent = deleteCommands;
        }}

        function copyToClipboard(elementId) {{
            const text = document.getElementById(elementId).textContent;
            navigator.clipboard.writeText(text).then(() => {{
                alert('Copied to clipboard');
            }}).catch(err => {{
                console.error('Failed to copy: ', err);
            }});
        }}
    </script>
</body>
</html>
""".format(networks_js=networks_js)

# Make a folder called out if it doesn't exist
if not os.path.exists("out"):
    os.makedirs("out")
# Write HTML content to file
with open("out/index.html", "w") as file:
    file.write(html_content)