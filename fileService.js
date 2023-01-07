const handleUploadFile = (context) => {
    const {originalname: name, mimetype: type, size} = context.file
    return {
        name,
        type,
        size,
    }
}

module.exports = {
    handleUploadFile,
}