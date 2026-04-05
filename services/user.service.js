const userRepository = require('../repositories/user.repository');

const getAllUsers = async () => {
    return await userRepository.getAllUsers();
};

const getUserById = async (id) => {
    const user = await userRepository.findUserById(id);
    if (!user) {
        throw { statusCode: 404, message: 'User not found' };
    }
    return user;
};

const updateUser = async (id, updateData) => {
    const user = await userRepository.findUserById(id);
    if (!user) {
        throw { statusCode: 404, message: 'User not found' };
    }
    return await userRepository.updateUser(id, updateData);
};

const deleteUser = async (id) => {
    const user = await userRepository.findUserById(id);
    if (!user) {
        throw { statusCode: 404, message: 'User not found' };
    }
    return await userRepository.deleteUser(id);
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
};
