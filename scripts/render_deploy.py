import os
import json
import urllib.request
import urllib.error
import sys

api_key = os.environ['RENDER_API_KEY']
anthropic_key = os.environ['ANTHROPIC_API_KEY']
SERVICE_NAME = 'oklahoma-seo-growth-engine'

def api(path, method='GET', body=None):
    url = 'https://api.render.com/v1' + path
    headers = {
        'Authorization': 'Bearer ' + api_key,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        resp = urllib.request.urlopen(req, timeout=30)
        raw = resp.read()
        if not raw.strip():
            return {}
        return json.loads(raw)
    except urllib.error.HTTPError as e:
        body_text = e.read().decode()
        print(f'HTTP {e.code}: {body_text}')
        raise

print('Getting owner ID...')
owners = api('/owners?limit=1')
owner_id = owners[0]['owner']['id']
print(f'Owner: {owner_id}')

print('Checking for existing service...')
services = api('/services?limit=100')
existing_id = None
existing_name = None
for s in services:
    if isinstance(s, dict) and s.get('service', {}).get('name') == SERVICE_NAME:
        existing_id = s['service']['id']
        existing_name = s['service']['name']
        break

if existing_id:
    print(f'Service {existing_id} ({existing_name}) already exists - triggering redeploy')
    result = api(f'/services/{existing_id}/deploys', method='POST', body={'clearCache': 'do_not_clear'})
    deploy_id = result.get('id', 'unknown') if result else 'triggered'
    print(f'Deploy triggered: {deploy_id}')
    print(f'Dashboard: https://dashboard.render.com/web/{existing_id}')
    print('SUCCESS: Service exists and redeploy triggered')
else:
    print('Creating new service...')
    payload = {
        'type': 'web_service',
        'name': SERVICE_NAME,
        'ownerId': owner_id,
        'repo': 'https://github.com/Eroc65/auto-gpt',
        'branch': 'main',
        'serviceDetails': {
            'env': 'node',
            'buildCommand': 'npm ci && npm run build',
            'startCommand': 'npm run start',
            'healthCheckPath': '/api/health',
            'numInstances': 1,
            'plan': 'free',
        },
        'envVars': [
            {'key': 'ANTHROPIC_API_KEY', 'value': anthropic_key},
        ],
    }
    result = api('/services', method='POST', body=payload)
    service_id = result.get('service', {}).get('id', '')
    if not service_id:
        print(f'FAILED: {result}')
        sys.exit(1)
    print(f'SUCCESS: Created service {service_id}')
    print(f'Dashboard: https://dashboard.render.com/web/{service_id}')
