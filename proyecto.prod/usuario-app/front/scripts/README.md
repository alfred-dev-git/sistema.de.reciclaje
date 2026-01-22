#  Documentation Generator of version in Simi - D.G.I.S

## Descripción:
Este proyecto llamado Generador de documentaciones de versiones en Simi genera registros en la versión mediante tu último commit y, con inteligencia artificial, te genera la documentación en las versiones.

## Tecnologías Utilizadas:

jq-1.8.1
groqcloud modelo qgween, pero puedes usar uno a tu critero u/o elección
Bourne Shell

## Pasos a seguir en configuración del Proyecto:

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
Te registras un usuario, pegas el modelo y tu clave para generar correctamente el documento

## Asegúrate de tener instalado:

### En windows:

jq-1.8.1 
El método de instalación es el siguiente: en Windows debes descargar el exe de este repositorio
https://github.com/jqlang/jq/releases/tag/jq-1.8.1
Y guardarlo con el nombre jq, luego guardarlo en el System32 en la carpeta raiz 

### En linux :

```bash
sudo apt update
sudo apt install jq
```

Puedes saber si está correctamente instalado verificando la versión con el comando

```bash
jq --version
```

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
 
## Contribuir:

Forkea el proyecto (Fork).
Crea tu rama de función (git checkout -b feature/nueva-funcionalidad).
Realiza commit de tus cambios (git commit -m 'Añade nueva funcionalidad').
Haz push a la rama (git push origin feature/nueva-funcionalidad).
Abre una solicitud de extracción (Pull Request).

## Contacto:

Desarrollador: [Leandro Joel Ramos]
Correo electrónico: [leandro.ramos@siliconmisiones.gob.ar]