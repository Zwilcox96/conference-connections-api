module.exports.processMongooseSaveError =  function (error, res){
    console.log(error);
    if(error.code === 11000){
        res.status(409).json({
            "message": "This document already exists"
        })
    } else {
        res.status(500).json({
            "message": "Unable to create document"
        })
    }
};
