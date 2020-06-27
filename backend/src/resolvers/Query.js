const { forwardTo } = require("prisma-binding");
const { hasPermission } = require("../utils");

const Query = {
  items: forwardTo("db"),
  item: forwardTo("db"),
  itemsConnection: forwardTo("db"),
  me(parent, args, ctx, info) {
    //Check if user already logged in
    if (!ctx.request.userId) {
      return null;
    }

    return ctx.db.query.user(
      {
        where: { id: ctx.request.userId },
      },
      info
    );
  },
  async users(parent, args, ctx, info) {
    //check if logged in
    if (!ctx.request.userId) {
      throw new Error("You must be logged in");
    }
    //check if user has permission to query all users
    hasPermission(ctx.request.user, ["ADMIN", "PERMISSIONUPDATE"]);
    //query all users
    return ctx.db.query.users({}, info);
  },
  async order(parent, args, ctx, info) {
    //make sure user is logged in
    if (!ctx.request.userId) {
      throw new Error("You must be logged in");
    }

    //query current order
    const order = await ctx.db.query.order(
      {
        where: { id: args.id },
      },
      info
    );
    //check if user has permission to see order

    const ownsOrder = order.user.id === ctx.request.userId;
    const hasPermission = ctx.request.user.permissions.includes("ADMIN");

    if (!ownsOrder || !hasPermission) {
      throw new Error("You do not have the permission to do this");
    }
    //return the order
    return order;
  },
  async orders(parent, args, ctx, info) {
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error("you must be signed in!");
    }
    return await ctx.db.query.orders(
      {
        where: {
          user: { id: userId },
        },
      },
      info
    );
  },
};

module.exports = Query;
