import matplotlib.pyplot as plt
import json
import sys
import time

import pathlib
pathlib.Path('./dist/figures').mkdir(parents=True, exist_ok=True)

for line in iter(sys.stdin.readline, ''):
  try:
    data = json.loads(line)
  except json.decoder.JSONDecodeError:
    pass

names = [key for key, _ in data['dataset'].items()]
values = [value for _, value in data['dataset'].items()]
label = data['label']

plt.figure(figsize=(6, 6))
plt.bar(names, values)
plt.suptitle(label)
plt.savefig(f'./dist/figures/{label}.png')
