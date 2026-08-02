import os

directory = r'apps/admin/app/(protected)'

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Simple replacement: change '../' to '../../' but handle multiple correctly?
    # Actually, we can just replace 'from \'../' with 'from \'../../'
    # and 'from \"../' with 'from \"../../'
    # But some imports might be deeper like 'from \'../../features\'' which becomes 'from \'../../../features\''
    # Wait, the easiest way is to parse line by line
    new_lines = []
    changed = False
    for line in content.split('\n'):
        if 'import ' in line and 'from ' in line and '../' in line:
            new_line = line.replace('\'../', '\'../../').replace('\"../', '\"../../')
            new_lines.append(new_line)
            if new_line != line:
                changed = True
        else:
            new_lines.append(line)
            
    if changed:
        with open(filepath, 'w', encoding='utf-8') as file:
            file.write('\n'.join(new_lines))
        print(f'Updated {filepath}')

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            # Don't touch profile, users, as I manually updated them and maybe messed them up or they're already correct?
            # Wait, my previous manual fixes might be double-replaced!
            # Let's skip profile and users directories to be safe, I'll review them manually.
            if 'profile' in root or 'users' in root:
                continue
            replace_in_file(os.path.join(root, file))
