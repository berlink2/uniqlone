import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Form from "./styles/Form";
import Error from "./ErrorMessage";
import { CURRENT_USER_QUERY } from "./User";
import Router from "next/router";
const SIGNUP_MUTATION = gql`
  mutation SIGNUP_MUTATION(
    $email: String!
    $name: String!
    $password: String!
  ) {
    signup(email: $email, name: $name, password: $password) {
      id
      name
      email
    }
  }
`;

export default class Signup extends Component {
  state = {
    email: "",
    name: "",
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
        mutation={SIGNUP_MUTATION}
        variables={this.state}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(signup, { error, loading }) => {
          return (
            <Form
              method="POST"
              onSubmit={async (e) => {
                e.preventDefault();
                await signup();
                this.setState({ email: "", name: "", password: "" });
                Router.push("/");
              }}
            >
              <fieldset disabled={loading} aria-busy={loading}>
                <h2>Sign up for an account</h2>
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

                <label htmlFor="name">
                  Name
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={this.state.name}
                    onChange={this.handleChange}
                  />
                </label>
                <label htmlFor="password">
                  Password
                  <input
                    type="password"
                    name="password"
                    placeholder="A good password"
                    value={this.state.password}
                    onChange={this.handleChange}
                  />
                </label>
                <button type="submit">Sign up!</button>
              </fieldset>
            </Form>
          );
        }}
      </Mutation>
    );
  }
}
