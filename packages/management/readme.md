# Shio management CLI

## Local usage
start local server for CLI command
```
$ yarn dev
```

## Asset management
### Book
- Create new book asset
```
shio asset book add [options]
Options:
  -f, --file <string>: path to zipfile to upload (must include content.pdf, cover.jpg)
  -t, --title <string>: book title
  -d, --desc <string>: book description
```

- List book aset
```
shio asset book list [options]
Options:
  --offset <number>: page offset
  --limit <number>: page limit
```