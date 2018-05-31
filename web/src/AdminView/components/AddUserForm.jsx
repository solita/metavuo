import React from 'react';
import axios from 'axios';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';

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
            className="form-control"
            name="name"
            label="Name *"
            value={this.state.name}
            onChange={this.handleChange}
            margin="normal"
            fullWidth
            validators={['required', 'maxStringLength:500']}
            errorMessages={['Name is required.', 'Maximum length is 500 characters.']}
          />
          <TextValidator
            className="form-control"
            name="email"
            label="Email *"
            value={this.state.email}
            onChange={this.handleChange}
            margin="normal"
            fullWidth
            validators={['required', 'isEmail']}
            errorMessages={['Email address is required.', 'Email is not valid.']}
          />
          <TextValidator
            className="form-control"
            name="organization"
            label="Organization *"
            value={this.state.organization}
            onChange={this.handleChange}
            margin="normal"
            fullWidth
            validators={['required', 'maxStringLength:500']}
            errorMessages={['Organization is required.', 'Maximum length is 500 characters.']}
          />
          <DialogActions>
            <Button variant="raised" className="secondary-button text-button" onClick={this.props.closeForm}>
              <i className="material-icons text-button-icon">close</i>Cancel
            </Button>
            <Button type="submit" id="submit-user" variant="raised" className="primary-button text-button">
              <i className="material-icons text-button-icon">save</i>Save
            </Button>
          </DialogActions>
        </ValidatorForm>
      </div>
    );
  }
}

AddUserForm.propTypes = {
  closeForm: PropTypes.func.isRequired,
};

export default AddUserForm;
