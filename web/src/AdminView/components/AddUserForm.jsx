import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import Button from 'material-ui/Button';

class AddUserForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      organization: '',
      message: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState({ message: '' });

    axios.post(
      '/api/admin/users',
      JSON.stringify({
        name: this.state.name,
        email: this.state.email,
        organization: this.state.organization,
      }),
    )
      .then((res) => {
        if (res.status === 200) {
          this.props.closeForm();
        }
      })
      .catch((err) => {
        if (err.response.status === 400) {
          if (err.response.data.toString().length > 3) {
            this.setState({ message: err.response.data });
          } else {
            this.setState({ message: 'form is not valid' });
          }
        } else {
          this.setState({ message: 'something went wrong' });
        }
      });
  }

  render() {
    return (
      <div>
        <p className="message-errors">{this.state.message}</p>
        <ValidatorForm
          id="user-form"
          onSubmit={this.handleSubmit}
          autoComplete="off"
        >
          <TextValidator
            className="form-item form-control"
            id="name"
            name="name"
            label="Name"
            value={this.state.name}
            onChange={this.handleChange}
            margin="normal"
            validators={['required']}
            errorMessages={['Name is required.']}
          />
          <TextValidator
            className="form-item form-control"
            id="email"
            name="email"
            label="Email"
            value={this.state.email}
            onChange={this.handleChange}
            margin="normal"
            validators={['required', 'isEmail']}
            errorMessages={['Email address is required.', 'Email is not valid.']}
          />
          <TextValidator
            className="form-item form-control"
            id="organization"
            name="organization"
            label="Organization"
            value={this.state.organization}
            onChange={this.handleChange}
            margin="normal"
            validators={['required']}
            errorMessages={['Organization is required.']}
          />
          <div className="form-item">
            <Button type="submit" id="submit-user" variant="raised" color="primary">
              <i className="material-icons icon-left">save</i>Add
            </Button>
          </div>
        </ValidatorForm>
      </div>
    );
  }
}

AddUserForm.propTypes = {
  closeForm: PropTypes.func.isRequired,
};

export default AddUserForm;
