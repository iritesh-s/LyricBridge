import pandas as pd;

file = pd.read_json('./Documents/new.json')
file = file.rename(columns={'status' : 'Status' , 'lyrics' : 'Lyrics' , 'lrc' : 'LRC Status'})
file['Lyrics'] = file['Lyrics'].str.replace('\n', ' ', regex=False).str.slice(0, 32000)
file = file.sort_values(by='Status').reset_index(drop=True)
#file
#? print(file)

# Editing the excel dataframe
excel_path = './Documents/Dataset.xlsx'

existing_data = pd.read_excel(excel_path)
existing_data = existing_data.loc[(existing_data['Status'] != 'API Error')]
#? print(existing_data)

new = pd.concat([existing_data, file])
new['LRC Status'] = new['LRC Status'].astype(bool)
#? print(new)

#exporting to excel
new.to_excel(excel_path, index=False, engine='openpyxl')
print("Updated the Excel File!")