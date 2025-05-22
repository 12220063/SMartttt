const Image = require("../../models/Image");
const { spawn } = require("child_process");

exports.uploadImage = async (req, res) => {
  const imagePath = req.file.path;
  const python = spawn("python3", ["./yolo/runModel.py", imagePath]);

  python.stdout.on("data", async (data) => {
    const predictedClass = data.toString().trim();
    const image = await Image.create({ filename: req.file.filename, predictedClass });

    res.json({
      message: "Image classified",
      class: predictedClass,
      audio: `/audio/${predictedClass}.mp3`
    });
  });
};
