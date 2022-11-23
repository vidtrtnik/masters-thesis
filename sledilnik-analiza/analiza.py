import csv
from collections import defaultdict

columns = defaultdict(list)
vsums = []
with open('vaccination.csv') as f:
    reader = csv.DictReader(f)
    for row in reader:
        for (k,v) in row.items():
            columns[k].append(v)

print(columns['date'])

for c, d in enumerate(columns['date']):
    v1 = 0
    v2 = 0
    v3 = 0
    
    if(columns['vaccination.administered'][c]):
        v1 = int(columns['vaccination.administered'][c])
    if(columns['vaccination.administered2nd'][c]):
        v2 = int(columns['vaccination.administered2nd'][c])
    if(columns['vaccination.administered3rd'][c]):
        v3 = int(columns['vaccination.administered3rd'][c])
        
    vsum = v1 + v2 + v3
    
    print(str(c) + "\t" + d + ": " + str(v1) + ", " + str(v2) + ", " + str(v3) + ": " + str(vsum))
    vsums.append(vsum)
    
print(vsums)

max_vac_ind = vsums.index(max(vsums))

print("\n\n\nHighest number of vaccinations: ", vsums[max_vac_ind])
print("First dose: ", columns['vaccination.administered'][max_vac_ind])
print("Second dose: ", columns['vaccination.administered2nd'][max_vac_ind])
print("Third dose: ", columns['vaccination.administered3rd'][max_vac_ind])
print("Date: ", columns['date'][max_vac_ind])

print("\nRequired entries per second: ", str(vsums[max_vac_ind]/12.0/60.0/60.0))
print("\n\n\n")
