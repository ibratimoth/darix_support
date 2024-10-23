const { sendResponse } = require("../utils/responses");
const { validateEmail } = require("../utils/validators");
const Message = require("./../models/messageModel");

const sendMessage = async (req, res) => {
  const { companyName, contactName, contactNumber, email, comment } = req.body;

  try {
    if (!companyName || !contactName || !contactNumber || !email || !comment) {
      return res.status(400).send({
        success: false,
        message: "All fields required",
      });
    }

    const validation = validateEmail(email); // Optional: Implement this function if needed
    if (!validation.valid) {
      return sendResponse(res, 400, false, validation.message);
    }

    const message = await Message.create({
      // Using Sequelize create method
      companyName,
      contactName,
      contactNumber,
      email,
      comment,
    });

    sendResponse(res, 201, true, "message sent successfully", {
      ...message.get(), // Use get() method to retrieve the user instance data // Don't send the password back in the response
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, "Error in sending a message", error);
  }
};

const getMessages = async (req, res) => {
  try {
    // Fetch all messages from the database
    const messages = await Message.findAll();

    // Check if there are no messages
    if (messages.length === 0) {
      return sendResponse(res, 404, false, "No messages found");
    }

    // Send success response with the list of messages
    sendResponse(res, 200, true, "Messages retrieved successfully", messages);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, "Error retrieving messages", error);
  }
};

const getMessageById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch message by id from the database
    const message = await Message.findByPk(id);

    // Check if the message exists
    if (!message) {
      return sendResponse(res, 404, false, "Message not found");
    }

    // Send success response with the message data
    sendResponse(res, 200, true, "Message retrieved successfully", message);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, "Error retrieving the message", error);
  }
};

const deleteMessageById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the message by id
    const message = await Message.findByPk(id);

    // Check if the message exists
    if (!message) {
      return sendResponse(res, 404, false, "Message not found");
    }

    // Delete the message
    await message.destroy();

    // Send success response
    sendResponse(res, 200, true, "Message deleted successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, "Error deleting the message", error);
  }
};

const deleteAllMessages = async (req, res) => {
  try {
    // Delete all messages from the database
    const deletedCount = await Message.destroy({ where: {}, truncate: true });

    // Check if there were any messages to delete
    if (deletedCount === 0) {
      return sendResponse(res, 404, false, "No messages to delete");
    }

    // Send success response
    sendResponse(res, 200, true, "All messages deleted successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, "Error deleting messages", error);
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getMessageById,
  deleteMessageById,
  deleteAllMessages,
};
