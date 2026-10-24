<div align="center">
  <h1>Kitab</h1>

Kitab is a self-hosted directory first document reader.

![Last commit][badge-last-commit]
![Commit activity][badge-commit-activity]
![Docker pulls][badge-docker-pulls]

</div>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#getting-started">Getting Started</a>
</p>

## Features

- **Annotations:** Highlight and annotate documents
- **Bookmarks:** Save important pages
- **Read aloud:** Listen to documents with fully local text-to-speech
- **Keyboard driven:** Supports all actions to be performed using keybinds

## Screenshots

![Library](https://github.com/user-attachments/assets/72047847-f502-451b-85c3-5e8b9811e4f5 "Library View")

![Modal](https://github.com/user-attachments/assets/b920a000-b12f-4744-a926-ebfbf0b81376 "Modal example")

![Annotations](https://github.com/user-attachments/assets/3afc52bd-3167-49e5-8d5c-8084230aa46a "Annotations example")

![Bookmarks](https://github.com/user-attachments/assets/70f15d33-913d-4eaf-bc11-dcab129929ab "Bookmarks example")

![Minimal](https://github.com/user-attachments/assets/6ee259fb-bd84-467c-abdc-1893eeabe92e "Minimal mode")


## Getting Started

Docker with docker-compose is the official way of installing and running Kitab. To get started use the compose.yaml file below.

```yaml
services:
  app:
    image: jetham/kitab:latest
    restart: unless-stopped
    ports:
      - "8000:8000"
    volumes:
     - /path/to/library:/app/library # directory for your PDF books/documents
     - /path/to/models:/app/models  # directory for downloaded TTS models 
```


[badge-last-commit]: https://img.shields.io/github/last-commit/ali-jetham/Kitab
[badge-commit-activity]: https://img.shields.io/github/commit-activity/w/ali-jetham/Kitab
[badge-docker-pulls]: https://img.shields.io/docker/pulls/jetham/kitab
