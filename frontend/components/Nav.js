import Link from "next/link";
import NavStyles from "./styles/NavStyles";
import User from "./User";
import Signout from "./Signout";
import { TOGGLE_CART_MUTATION } from "./Cart";
import { Mutation } from "react-apollo";
import CartCount from "./CartCount";

const Nav = () => (
  <User>
    {({ data: { me } }) => (
      <NavStyles>
        <Link href="/">
          <a>Shop</a>
        </Link>
        {me && (
          <>
            <Link href="/sell">
              <a>Sell</a>
            </Link>
            <Link href="/history">
              <a>Orders</a>
            </Link>
            <Link href="/sell">
              <a>Account</a>
            </Link>
            <Signout />
            <Mutation mutation={TOGGLE_CART_MUTATION}>
              {(toggleCart) => {
                return (
                  <button onClick={toggleCart}>
                    My Cart
                    <CartCount count={me.cart.length} />
                  </button>
                );
              }}
            </Mutation>
          </>
        )}
        {!me && (
          <>
            <Link href="/signup">
              <a>Sign in</a>
            </Link>
          </>
        )}
      </NavStyles>
    )}
  </User>
);
export default Nav;
