export const isUserAllowed = (user: any, roles: any) => {
    // Nếu user truyền lên là undifined
    if (!user) {
        return false
    }
    else if (user.roleId == 'guest') {
        return false
    }

    return true
    // Nếu không phải 'admin' thì kiểm tra xem user có role nào trong mảng roles không
    // const userRoles = Array.isArray(roles) ? roles : [roles]
    // Nếu user có ít nhất 1 role trong mảng roles thì được phép truy cập
    // return userRoles.some((role) => user.roles.includes(role))
}