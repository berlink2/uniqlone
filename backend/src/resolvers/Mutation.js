const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { promisify, isRegExp } = require("util");
const { transport, makeEmail } = require("../mail");
const { hasPermission } = require("../utils");
const stripe = require("../stripe");

const Mutations = {
  async createItem(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error("You must be logged in to create an item");
    }
    const item = await ctx.db.mutation.createItem(
      {
        data: {
          //Make 1 to 1 relationship between a item and a user
          user: { connect: { id: ctx.request.userId } },
          ...args,
        },
      },
      info
    );
    return item;
  },
  updateItem(parent, args, ctx, info) {
    //make copy of theupdates
    const updates = { ...args };
    //remove id
    delete updates.id;
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id,
        },
      },
      info
    );
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    //find item, check if user has permission, then delete

    const item = await ctx.db.query.item({ where }, `{id title user {id}}`);

    const ownsItem = item.user.id === ctx.request.userId;
    const hasPermissions = ctx.request.user.permissions.some((permission) => {
      ["ADMIN", "ITEMDELETE"].includes(permission);
    });

    if (!ownsItem && !hasPermissions) {
      throw new Error("You don't have permission for that action");
    }
    return ctx.db.mutation.deleteItem(
      {
        where,
      },
      info
    );
  },
  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase();

    //Hash password
    const password = await bcrypt.hash(args.password, 10);

    //Create user
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ["USER"] },
        },
      },
      info
    );
    //Make JWT token for auto signin after signup
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, //Cookie for 1 year
    });
    return user;
  },
  async signin(parent, { email, password }, ctx, info) {
    //check if user with email exists
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error("User with that email does not exist");
    }
    //check if password matches
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error("Incorrect password for that account");
    }
    //generate jwt set cookie with token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, //Cookie for 1 year
    });

    //return user
    return user;
  },
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie("token");
    return { message: "See you soon!" };
  },
  async requestReset(parent, { email }, ctx, info) {
    //Check if user exists
    const user = ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error("That account does not exist");
    }
    //Set reset token and expiration
    const randomBytesPromisified = await promisify(randomBytes)(20);
    const resetToken = randomBytesPromisified.toString("hex");
    const resetTokenExpiry = Date.now() + 3600000;
    const res = await ctx.db.mutation.updateUser({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    //Email reset token
    const mailRes = await transport.sendMail({
      from: "passwordRobot@uniqlone.com",
      to: email,
      subject: "Password Reset",
      html: makeEmail(
        `Your password reset link: \n\n <a href="${
          process.env.FRONTEND_URL
        }/reset?resetToken=${resetToken}">Reset Password</a>`
      ),
    });

    //return message
    return {
      message: "A reset password token has been sent to your email address.",
    };
  },
  async resetPassword(
    parent,
    { resetToken, password, confirmPassword },
    ctx,
    info
  ) {
    //Check if passwords match
    if (password !== confirmPassword) {
      throw new Error("Input in password fields must match");
    }
    //Check if token is legitimate and not expired
    const [user] = await ctx.db.query.users({
      where: {
        resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000,
      },
    });
    if (!user) {
      throw new Error(
        "Password reset token has expired. Please make another password reset request."
      );
    }

    //hash new password
    const newPassword = await bcrypt.hash(password, 10);
    //save new password to user and remove old reset token
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password: newPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
    //generate jwt  and set jwt cookie
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, //Cookie for 1 year
    });

    //return user
    return updatedUser;
  },
  async updatePermissions(parent, args, ctx, info) {
    //check if logged in
    if (!ctx.request.userId) {
      throw new Error("You must be logged in to create an item");
    }
    //query user
    const user = await ctx.db.query.user(
      { where: { id: ctx.request.userId } },
      info
    );
    //check if user has permissions
    hasPermission(ctx.request.user, ["ADMIN", "PERMISSIONUPDATE"]);
    //update permissions
    const updatedUser = await ctx.db.mutation.updateUser(
      {
        data: { permissions: { set: args.permissions } },
        where: { id: args.userId },
      },
      info
    );
    return updatedUser;
  },
  async addToCart(parent, args, ctx, info) {
    //check if user is logged in
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error("You must be logged in to add an item to cart");
    }
    //query users cart
    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: {
          id: userId,
        },
        item: { id: args.id },
      },
    });
    //check if item is in cart, increment if it is, if not create new cartitem
    if (existingCartItem) {
      return ctx.db.mutation.updateCartItem(
        {
          where: {
            id: existingCartItem.id,
          },
          data: { quantity: existingCartItem.quantity + 1 },
        },
        info
      );
    }

    return ctx.db.mutation.createCartItem(
      {
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          item: {
            connect: {
              id: args.id,
            },
          },
        },
      },
      info
    );
  },
  async removeFromCart(parent, args, ctx, info) {
    const { userId } = ctx.request;

    //find cart item
    const cartItem = await ctx.db.query.cartItem(
      {
        where: {
          id: args.id,
        },
      },
      `{id,user{id}}`
    );
    if (!cartItem) {
      throw new Error("No such item in your cart");
    }

    //does user own cart item
    if (cartItem.user.id !== userId) {
      throw new Error("Not your item");
    }

    //remove cart item
    return ctx.db.mutation.deleteCartItem(
      {
        where: {
          id: args.id,
        },
      },
      info
    );
  },
  async createOrder(parents, args, ctx, info) {
    //query current user and verify logged in
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error("You must be logged in to make an order");
    }
    const user = await ctx.db.query.user(
      {
        where: { id: userId },
      },
      `{id name email
         cart {id quantity item
                              {title price id description image largeImage}
          }
        }`
    );
    //calculate total for price
    const amount = user.cart.reduce(
      (total, cartItem) => total + cartItem.item.price * cartItem.quantity,
      0
    );

    //create stripe charge
    const charge = await stripe.charges.create({
      amount,
      currency: "USD",
      source: args.token,
    });
    //convert cart items to order items
    const orderItems = user.cart.map((cartItem) => {
      const orderItem = {
        ...cartItem.item,
        quantity: cartItem.quantity,
        user: { connect: { id: userId } },
      };
      delete orderItem.id;
      return orderItem;
    });
    // create the order
    const order = await ctx.db.mutation.createOrder({
      data: {
        total: charge.amount,
        charge: charge.id,
        item: { create: orderItems },
        user: { connect: { id: userId } },
      },
    });
    //clean up cart
    const cartItemIds = user.cart.map((cartItem) => cartItem.id);
    await ctx.db.mutation.deleteManyCartItems({
      where: { id_in: cartItemIds },
    });

    //return order to client
    return order;
  },
};

module.exports = Mutations;
