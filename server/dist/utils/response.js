export const successResponse = (res, data, message = '操作成功', statusCode = 200) => {
    const response = {
        success: true,
        message,
        data,
    };
    res.status(statusCode).json(response);
};
export const errorResponse = (res, message = '操作失败', statusCode = 400, error) => {
    const response = {
        success: false,
        message,
    };
    if (error)
        response.error = error;
    res.status(statusCode).json(response);
};
//# sourceMappingURL=response.js.map