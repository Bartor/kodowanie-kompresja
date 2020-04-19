Kompresowanie:
`node index.js compress <f|o|d|g> <plik wejściowy> <plik wyjściowy>`
gdzie f - kodowanie Fibonacciego, o - kodowanie Omega Eliasa, d - Delta, g - Gamma.

Dekompresowanie:
`node index.js decompress <plik wejściowy> <plik wyjściowy>`
W tym wypadku program sam odnajduje sposób kodowania dzięki pierwszemu bajtowi zawierającemu informację o sposobie kodowania i wielkości paddingu na końcu.

Program ten nie jest napisany zbyt wydajnie i dekompresja niektórych plików może zająć bardzo dużo czasu; działa natomiast dla dowolnego pliku.