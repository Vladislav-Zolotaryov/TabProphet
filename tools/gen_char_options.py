import string

with open('result.txt', 'w') as file:
	file.write('"options": [\n')
	for item in string.lowercase[:26]:
		option = '{\n'
		option += '\t"value": "'+ item +'",\n' 
		option += '\t"label": "'+ item.upper() +'"\n'
		option += '},\n'
		file.write(option)
		
	file.write(']');	