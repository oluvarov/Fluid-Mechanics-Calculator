const express = require('express');
const path = require('path');
const router = express.Router();
const app = express();

const port = process.env.PORT || 80;

var indexRouter = require('./routes/index');
app.use('/', indexRouter);

app.use(express.static(path.join(__dirname, 'public')));
// For parsing application/json
app.use(express.json());
  
// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.post('/calcReynoldsNum', (req, res) => {

      density=req.body.density;
      velocity=req.body.velocity;
      length=req.body.length;
      dviscosity=req.body.dviscosity;

    calculateReynoldsNum = ((density * velocity * length) / dviscosity);
    isLaminar = calculateReynoldsNum < 1780000;

    res.json({
        "reynoldsNum": calculateReynoldsNum,
        "isLaminar" : isLaminar
    })
  });

app.post('/calcCoef', (req, res) => {

    var reynoldsNum = req.body.reynoldsNum;
    var isLaminar = (reynoldsNum < 1750000);
    
    if(isLaminar != true) {
        frictionCoef = 0.027 / Math.pow(reynoldsNum, 1/7);
        dragCoef = 2 * frictionCoef;
        res.json({
            "frictionCoef" : frictionCoef,
            "dragCoef" : dragCoef,
            "isLaminar" : isLaminar
        })
    } else {
        frictionCoef = 0.664 / Math.sqrt(reynoldsNum);
        dragCoef = (7/6) * frictionCoef;
        res.json({
            "frictionCoef" : frictionCoef,
            "dragCoef" : dragCoef,
            "isLaminar" : isLaminar
        })
    }
});

app.post('/calcThickness', (req, res) => {
    reynoldsNum=req.body.reynoldsNum;
    isLaminar=reynoldsNum < 1780000;

    var boundaryLayerThickness;
    if (isLaminar === true) {
        boundaryLayerThickness = 5 / Math.sqrt(reynoldsNum);
    } else {
        boundaryLayerThickness = 0.16 / Math.pow(reynoldsNum, 1/7);
    }
    res.json({
        "boundaryLayerThickness" : boundaryLayerThickness,
        "isLaminar" : isLaminar
    })
})

app.post('/calcDragForce', (req,res) => {
    dragCoef = req.body.dragCoef;
    density = req.body.density;
    velocity = req.body.velocity;
    length = req.body.length;
    width = req.body.width;

    calcDragForce = dragCoef * (1/2 * density * Math.pow(velocity, 2) * width * length);
    res.json({
        "DragForceDueToSkinFriction" : calcDragForce
    })
})

app.post('/calcDynamicViscosity', (req,res) => {
    force = req.body.force;
    area = req.body.area;
    speed = req.body.speed;
    distance = req.body.distance;
    calcDynamicViscosity = (force * distance / area / speed);
    res.json({
        "dynamicViscosity" : calcDynamicViscosity
    })
})



app.listen(port, function(err){
    if (err) console.log("Error in server setup")
    console.log("Server listening on Port", port);
})

app.set('views', __dirname + '/views');
app.set('view engine', 'html');

module.exports = app;

