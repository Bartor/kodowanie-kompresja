Zakodowywanie: 

`node index.js <plik wejściowy .tga> <2 ^ liczba poziomów kwantyzacji (1 - 7)>`

Zostaną wyprodukowane dwa pliki binarne, `high_pass.encoded` oraz `low_pass.encoded`. Aby je odkodować, należy użyć:

`node index.js <plk wejściowy .encoded> -d`

Zostanie wyprodukowany plik wyjściowy `high_pass.tga` lub `low_pass.tga`. Program wykryje odpowiedni typ sposób kompresji i kodowania na podstawie nagłówków pliku, więc nie trzeba zmieniać komendy w żaden sposób dla high lub low.