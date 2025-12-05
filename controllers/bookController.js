const books = require("../models/bookModel")

exports.addBookController = async (req, res) => {


    console.log("inside add book");
    console.log(req.body);
    console.log(req.files);

    const { title, author, nop, imgUrl, price, discountPrice, abstract, publisher, language, isbn, category } = req.body

    console.log(title, author, nop, imgUrl, price, discountPrice, abstract, publisher, language, isbn, category);

    const uploadImg = []

    req.files.map(item => uploadImg.push(item.filename))

    console.log(uploadImg);

    const email = req.payload
    console.log(email);



    try {

        const existingUser = await books.findOne({ title, userMail: email })
        //console.log(existingUser);

        if (existingUser) {
            res.status(400).json({ message: "You already added this book" })
        } else {

            const newBook = new books({ title, author, nop, imgUrl, price, discountPrice, abstract, publisher, language, isbn, category, uploadImg: uploadImg, userMail: email })

            await newBook.save()

            res.status(200).json(newBook)

        }


    } catch (err) {
        res.status(500).json({ error: "Internal server error", details: err.message })
    }


}


exports.getHomeBookController = async (req, res) => {

    try {

        const homeBooks = await books.find().sort({ _id: -1 }).limit(4)
        res.status(200).json(homeBooks)

    } catch (err) {

        res.status(500).json(err)

    }

}

exports.getAllBooks = async (req, res) => {

    const searchKey = req.query.search
    console.log(searchKey);

    const query = {

        title: {
            $regex: searchKey, $options: 'i'
        }

    }


    try {

        const homeBooks = await books.find(query)
        res.status(200).json(homeBooks)

    } catch (err) {

        res.status(500).json(err)

    }

}


exports.getABook = async (req, res) => {

    try {
        const { id } = req.params
        console.log(id);

        const book = await books.findOne({ _id: id })
        res.status(200).json(book)

    } catch (err) {

        res.status(500).json(err)

    }

}