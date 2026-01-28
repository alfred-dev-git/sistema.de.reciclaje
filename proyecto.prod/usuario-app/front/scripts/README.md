#  Documentation Version Documentation Generator - V.D.G

## Descripción:

Este proyecto llamado Documentation Version Documentation Generator genera registros en la versión mediante tu último commit y, con inteligencia artificial, te genera la documentación en las versiones.

## Tecnologías Utilizadas:

jq-1.8.1,
groqcloud modelo elegido predeterminado qgween, pero puedes usar uno a tu critero y/o elección,
Bourne Shell.

# Pasos a seguir en configuración del Proyecto manual:

Cuando obtengas del repositorio el archivo scripts, pégalo en la carpeta raíz de tu proyecto,
Y en la carpeta raíz de tu proyecto crearás un .env o usarás uno existente con estos datos, respetando las variables.

```bash
GROQ_API_KEY="tu-clave"
GROQ_MODEL="modelo-a-elección"
GROQ_URL="https://api.groq.com/openai/v1/chat/completions"
NAME_AUTOR="TuNombre"
NAME_PROJECT="NombreDelProjecto"
```
El modelo del Groq o su clave API la puedes crear en https://console.groq.com/home, este sitio web.
Te registras un usuario, pegas el modelo y tu clave para generar correctamente el documento.

## Asegúrate de tener instalado:

### En windows:

jq-1.8.1 
El método de instalación es el siguiente: en Windows debes descargar el exe de este repositorio
https://github.com/jqlang/jq/releases/tag/jq-1.8.1
Y guardarlo con el nombre jq, luego guardarlo en el System32 en la carpeta raiz.

### En linux :

```bash
sudo apt update
sudo apt install jq
```

Puedes saber si está correctamente instalado verificando la versión con el comando.

```bash
jq --version
```

# Pasos a seguir en configuración del Proyecto Automatico:

estos pasos ahorran todo lo anterior dicho hace una instalacion de todos los recursos necesario y modificacion aplicada a la tecnologia usada
facilitando todo en general.

es un suceso de pasos, que es el siguiente: 

deberas darle permisos de administrador si usas windows ya que te instalara el jq en el system 32,
te preguntara en primeras el S.O que usas ahi aplicas el que usas inslando el jq que es necesario para enviar 
lo segundo te preguntara cual es tu tecnologia que usas en el proyecto ejemplo node, python, maven, etc.
para la modificacion exacta de los archivos su version creciente
por ultimo deberas añadir o reutilizar tu .env en la raiz del proyecto para que 

```bash
GROQ_API_KEY="tu-clave"
GROQ_MODEL="modelo-a-elección"
GROQ_URL="https://api.groq.com/openai/v1/chat/completions"
NAME_AUTOR="TuNombre"
NAME_PROJECT="NombreDelProjecto"
```
El modelo del Groq o su clave API la puedes crear en https://console.groq.com/home, este sitio web.
Te registras un usuario, pegas el modelo y tu clave para generar correctamente el documento.

## Ejecución del Generador:

Para que funcione el versionado automatico, deberas de hacer un commit común y corriente, pero con la diferencia de usar palabras clave que aumentarán su versión Automaticamente.
pero antes una explicacion breve: 

La versión se divide en tres partes 
major, minor y patch
[0.     0.      0]
Para ir actualizando automáticamente en el commit, se deberán usar estas palabras con cuidado.

BREAKING CHANGE: Esto aumentará el mayor, o sea, la versión pasará al 1. 0 .0 <br/>
feat: Esto aumentará el minor, o sea, la versión pasará a la 0. 1 .0 <br/>
fix: u otro cualquiera ejemplo como mod, aumentará la versión y pasará a la en el patch 0. 0 .1 <br/>

un ejemplo de como usar el comando con la palabra clave de git es asi: <br/>
(git commit -m 'BREAKING CHANGE: Update newVersion')
esto automaticamente actualizara a la versión 1.0.0 hay que respetar tal cual en mayúsculas escritas
y por ultimo para generar el documento
hay que ejecutar este comando 

```bash
 ./scripts/release.sh
```

### verificar la version o info de VDG y comandos

puedes verificar la version del VDG de la siguiente manera 
sh ./scripts/app.sh -v o --version o si instalaste automatico y te funcionan los comandos podes usar VDG --Version al final esto arrojara en consola su version de la app 
sh ./scripts/app.sh --info lo mismo con este VDG --info esto dara el nombre del autor de la aplicación, el nombre del proyecto y su descripción.
por ultimo para generar podes usar VDG generate en vez de scripts/release.sh 
 
## Contribuir:

Forkea el proyecto (Fork).
Crea tu rama de función (git checkout -b feature/nueva-funcionalidad).
Realiza commit de tus cambios (git commit -m 'Añade nueva funcionalidad').
Haz push a la rama (git push origin feature/nueva-funcionalidad).
Abre una solicitud de extracción (Pull Request).

## Contacto:

Desarrollador: [Leandro Joel Ramos]
Correo electrónico: [leandro.ramos@siliconmisiones.gob.ar]