# UnSt - Universal Storage Tool

```

                          8 8888      88 b.             8    d888888o. 8888888 8888888888 
                          8 8888      88 888o.          8  .`8888:' `88.     8 8888       
                          8 8888      88 Y88888o.       8  8.`8888.   Y8     8 8888       
                          8 8888      88 .`Y888888o.    8  `8.`8888.         8 8888       
                          8 8888      88 8o. `Y888888o. 8   `8.`8888.        8 8888       
                          8 8888      88 8`Y8o. `Y88888o8    `8.`8888.       8 8888       
                          8 8888      88 8   `Y8o. `Y8888     `8.`8888.      8 8888       
                          ` 8888     ,8P 8      `Y8o. `Y8 8b   `8.`8888.     8 8888       
                            8888   ,d8P  8         `Y8o.` `8b.  ;8.`8888     8 8888       
                             `Y88888P'   8            `Yo  `Y8888P ,88P'     8 8888       
                                      ㄩ几丨ᐯ乇尺丂卂ㄥ 丂ㄒㄖ尺卂Ꮆ乇 ㄒㄖㄖㄥ

```

## Requirements (in Romanian)
> Pe baza unui API REST ori GraphQL propriu, să se realizeze un instrument care abstractizează operațiile uzuale cu fișiere de mari dimensiuni, stocându-le – eventual, fragmentat și/sau redundant – via servicii disponibile “în nori” precum Box, Dropbox, Google Drive, Microsoft OneDrive și altele. Soluția implementată va recurge la minim 3. Se va oferi și posibilitatea compresiei resurselor textuale, folosind algoritmi consacrați precum bzip2, gzip sau zip. Evident, se va furniza suport și pentru recompunerea resurselor și preluarea sigură și eficientă a acestora. Autentificarea si autorizarea vor recurge la OAuth. Resurse suplimentare: Storage APIs and Mashups.
> Un utilizator va putea să își facă cont într-o aplicație web ce utilizează serviciul web de mai sus și va putea să își introducă credențiale pentru diversele "drive"-uri. Aplicația îi va arăta cât spațiu mai are disponibil în fiecare dintre mediile de stocare în cloud și cât spațiu liber mai are în total (suma spațiilor din fiecare drive). La uploadarea unui fișier, se va face automat împărțirea sa în chunk-uri și memorarea (BD) a locației în care se află fiecare porțiune a fișierului pentru a putea fi reconstruit. 

## Maintainers
- reloadedd ([@reloadedd](https://github.com/reloadedd))
- Tache Radu ([@TacheRadu](https://github.com/TacheRadu))
- Iulian Peiu ([@iulianPeiu6](https://github.com/iulianPeiu6))
