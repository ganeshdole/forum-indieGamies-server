const threadsModel = require('../db/models/threadsModel')
const { createSuccess, createError } = require('../utils/utils')


const getLatestThread = async (req, res) => {
    try {
        const page = req.query.page;
        const limit = req.query.limit;

        const threads = await threadsModel.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page -1 )* limit); 

        if (threads.length === 0) {
            return res.status(404).json(createError('No threads found'));
        }
        
        res.status(200).json(createSuccess(threads));
    } catch (error) {
        console.error('Error getting threads:', error.message);
        res.status(500).json(createError('Error getting threads', error.message));
    }
}
const getThreadById = async(req, res) =>{
    try{
        const threadId = req.params.threadId
        if (!threadId) {
            return res.status(400).json({ message: 'Thread ID is required' });
        }

        const thread = await threadsModel.findById(threadId);
        if (!thread) {
            return res.status(404).json({ message: 'No thread found' });
        }
        return res.status(200).json(thread);
    }catch(error){
        console.error('Error getting threads:', error);
        return res.status(500).json({ message: 'Error getting threads', error: error.message });
    }
}

const getThreadsByCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        if (!categoryId) {
            return res.status(400).json({ message: 'Category ID is required' });
        }
        const threads = await threadsModel.find({ category: categoryId });
        console.log(threads)
        if (!threads) {
            return res.status(404).json({ message: 'No threads found for this category' });
        }
        return res.status(200).json(threads);
    } catch (error) {
        console.error('Error getting threads:', error);
        return res.status(500).json({ message: 'Error getting threads', error: error.message });
    }
};


const postNewThread = async (req, res) =>{
    try {
        const { title, description, categoryId} = req.body;
        const author = req.user.username;
        const userId = req.user.id;
        if (!title || !description || !categoryId) {
            return res.status(400).json({ message: 'Title, content, and category are required' });
        }

        const newThread = new threadsModel({
            title,
            description,
            category: categoryId,
            userId,
            author,
            replies : 0,
            views : 0,
        });
        const thread = await newThread.save();
        return res.status(200).json(createSuccess(thread));
        }catch(error){
            console.error('Error creating thread:', error.message);
            return res.status(500).json({ message: 'Error creating thread', error: error.message });
        }
}


const updateThreadById = async (req, res) =>{
    try{
        const thread = {}
        const threadId = req.params.threadId;

        if (!threadId) {
            return res.status(400).json({ message: 'Thread ID is required' });
        }

        const {views, replies , description } = req.body;

        if(views) thread.views = views;
        if(replies) thread.replies = replies;   
        if(description) thread.description = description;

        const updatedThread = await threadsModel.findByIdAndUpdate(threadId, thread, {new: true});

        if (!updatedThread) {
            return res.status(404).json({ message: 'No thread found' });
        }
        return res.status(200).json(updatedThread);
    }catch(error){
        console.error('Error updating thread:', error.message);
        return res.status(500).json({ message: 'Error updating thread', error: error.message });
    }
}


const deleteThread = async (req, res) => {
    try {
        const { id } = req.user;
        const { threadId } = req.params;

        const thread = await threadsModel.findById(threadId);

        if (!thread) {
            return res.status(404).json(createError('Thread not found'));
        }

        if (thread?.userId.toString() !== id) {
            return res.status(403).json(createError('Unauthorized: You do not have permission to delete this thread'));
        }

        await threadsModel.findByIdAndDelete(threadId);


        // await repliesModel.deleteMany({ threadId });

        return res.status(200).json(createSuccess('Thread deleted successfully'));
    } catch (error) {
        console.error('Error deleting thread:', error);
    }
};

module.exports = {
    getLatestThread, getThreadsByCategory,getThreadById, postNewThread, updateThreadById, deleteThread
}