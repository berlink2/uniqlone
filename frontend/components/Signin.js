import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Form from "./styles/Form";
import Error from "./ErrorMessage";
import { CURRENT_USER_QUERY } from "./User";
import Router from "next/router";
const SIGNIN_MUTATION = gql`
  mutation SIGNIN_MUTATION($email: String!, $password: String!) {
    signin(email: $email, password: $password) {
      id
      name
      email
    }
  }
`;

export default class Signin extends Component {
  state = {
    email: "",
    password: "",
  };

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };
  render() {
    return (
      <Mutation
        mutation={SIGNIN_MUTATION}
        variables={this.state}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(signin, { error, loading }) => {
          return (
            <Form
              method="POST"
              onSubmit={async (e) => {
                e.preventDefault();
                await signin();
                this.setState({ email: "", password: "" });
                Router.push("/");
              }}
            >
              <fieldset disabled={loading} aria-busy={loading}>
                <h2>Sign in to your account</h2>
                <Error error={error} />
                <label htmlFor="email">
                  Email
                  <input
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={this.state.email}
                    onChange={this.handleChange}
                  />
                </label>

                <label htmlFor="password">
                  Password
                  <input
                    type="password"
                    name="password"
                    placeholder="Your password"
                    value={this.state.password}
                    onChange={this.handleChange}
                  />
                </label>
                <button type="submit">Sign in!</button>
              </fieldset>
            </Form>
          );
        }}
      </Mutation>
    );
  }
}
