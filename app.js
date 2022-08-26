const webpush = require('web-push');
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());
app.use(bodyParser.json());


const vapidKeys = {
    publicKey: "BJRRivUnhAT_O7IUClWKroyJkD-dsTb-gFsd2EcoJWNn8cG7K0gxe8gjzBj4acLweaovvTm1C82HTACzJbXY5pM",
    privateKey: "EpH96kz83og6WlHg9EbSMD6r1f_VTTYNxWdxdoSE0lc"
}
webpush.setVapidDetails(
    'mailto:tonovarela@live.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

const handlerResponse = (res, data, code = 200) => {
    res.status(code).send({ data });
}

const savePush = (req, res) => {
    const name = Math.floor(Date.now() / 1000);
    const { token } = req.body;
    let data = JSON.stringify(token, null, 2);
    fs.writeFile(`./tokens/token-${name}.json`, data, (err) => {
        if (err) throw err;
        handlerResponse(res, "Se ha guardado el token", 200);
    })
}



const sendPush = (req, res) => {
    const payload = {
        "notification": {
            "title": "Litoprocess Almacen",
            "body": "Se ha actualizado el inventario en Metrics",
            "vibrate": [100, 50, 100],
            "actions": [{
                "action": "explore",
                "title": "Atender"
            }]
        }
    }
    const directoryPath = path.join(__dirname, 'tokens');
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            handlerResponse(res, "Error en la lectura", 500);
        }
        files.forEach(file => {
            const tokenRaw = fs.readFileSync(`${directoryPath}/${file}`);
            const tokenParse = JSON.parse(tokenRaw);

            webpush.sendNotification(
                tokenParse,
                JSON.stringify(payload)).then(res => {
                    console.log("Enviado notificación")
                }).catch(err => {
                    console.log("Error");
                });
        })
    });
    handlerResponse(res, 'Se envio la notificacion' , 200)
}

app.route('/save').post(savePush);
app.route('/send').post(sendPush);


const httpServer = app.listen(9000, () => {
    console.log("HTTP Server running at http://localhost:" + httpServer.address().port);
});