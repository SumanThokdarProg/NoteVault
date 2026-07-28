
const notesController = (req, res) => {
    res.json({
        "message": "here user message",
        "userid": req.user.userid
    });
}

module.exports = {
    notesController
}