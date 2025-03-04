<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# siproad-admin-api
Api del sistema siproad que permite gestionar compañias, usuarios, roles y permisos.

```
- Lenguaje: Nodejs (Nest), typescript.
- Base de Datos: Mariadb.
- Tecnologias: Docker, sns/sqs AWS.
```

## Configuración ambiente dev

### Configuración de la api
* Tener Nest CLI instalado ```npm i -g @nestjs/cli```
* Clonar el proyecto.
* Clonar el archivo __.env.template__ y renombrar la copia a ```.env```
* Configurar los valores de las variables de entornos correspondientes ```.env```
* Actualizar node_modules ```npm install```

### Configuración de la base de datos (docker)
* Instalar Docker Desktop.
  * Limitar memoria del wsl utilizado por docker
  * Abrir archivo wsl ```notepad %USERPROFILE%\.wslconfig```
  * Copiar dentro del archivo wslconfig el siguiente contenido:
    ```
    [wsl2]
    memory=2GB   # Limita a 2GB de RAM
    processors=4  # Usa solo 4 núcleos
    swap=2GB      # Agrega 2GB de swap
    ```
  * Reiniciar wsl ```wsl --shutdown```
* Abrir Docker Desktop.
* Descargar imagen mariadb.
* Comentar la creacion de la api en el docker-compose para crear solo la base de datos.
* Crear contenedor de base de datos y api ```docker-compose -p dev-siproad up -d```

## Configuración ambiente stg

### Configuración de la base de datos y api (docker)
* Apuntar el archivo .env a las variables de staging.
* Descomentar la creacion de la api en el docker-compose.
* Crear contenedor de base de datos y api ```docker-compose -p siproad up -d```