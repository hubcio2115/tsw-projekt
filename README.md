# Serwis Y

W oparciu o (i z wykorzystaniem) `Node.js` i biblioteki `Socket.io` oraz `Vue.js` stwórz serwis społecznościowy pozwalający na następujące operacje:

## Wersja na <= 3.5

- Autoryzacja
  - [x] Rejestracja w serwisie
  - [x] Logowanie do serwera
- Profil użytkownika
  - [ ] Tworzenie wizytówki użytkownika konta zawierającej:
    - [x] „awatar”
    - [ ] wizytówka określa co inni użytkownicy widzą na nasz temat
- [ ] Obserwowanie innych użytkowników
- [ ] Tworzenie postów i wątków (zamieszczamy w nich wyłącznie wpisy tekstowe)
- [ ] Odpowiadanie na wpisy (odpowiedź generuje potencjalne rozgałęzienie wątku)
- [ ] Podgląd wpisów danego użytkownika (w ramach interfejsu konta), na stronie profilu
- [ ] Cytowanie wpisów?

## Wersja na >= 4

- Responsywność interfejsu
- [ ] Podczas przeglądania wątku jesteśmy informowaniu o fakcie pojawienia się w nim nowych wpisów
- [ ] Możliwość umieszczania we wpisach obrazów
- [ ] Blokowanie użytkowników (z powiadomieniem o zablokowaniu)
- Metadane wpisu:
  - [ ] Liczba wyświetleń
  - [ ] Dynamiczne odświerzanie liczby odsłon w momencie, w którym wpisu nie widać (bez odświerzania strony)

## Wyjaśnienia ogólne

- Z uwagi na możliwość cytowania wpisy tworzą strukturę grafu (fizyczna reprezentacja po stronie bazy danych może oczywiście nie być grafem)
- W przypadku „blokady”, blokowany użytkownik powinien być informowany, że (konkretny) ktoś go zablokował. Blokada uniemożliwia oglądanie wpisów (ani metadanych) użytkownika, który nas zablokował.
- Obserwowanie użytkownika powoduje, że jego wpisy (pochodzące ze zdefiniowanego przez nas „okienka czasowego”), których dotychczas nie widzieliśmy pojawiają się na naszej „stronie głównej” _Serwisu-Y_.

## Uwagi techniczne

- Interfejs użytkownika budujemy za pomocą `Vue.js` (w wersji 3.\*) z wykorzystaniem języka `JavaScript` i dowolnie wybranego środowiska – opartego na `Vue CLI` lub `vite`.
- Do połączeń z serwerem wykorzystujemy szyfrowanie (zarówno w części `HTTP` jak i `Websockets`)
- _Serwis-Y_ powinien przechowywać wpisy użytkowników oraz ich metadane w wybranej przez autora bazie danych.
