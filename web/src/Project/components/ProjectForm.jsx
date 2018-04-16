import React from 'react';
import axios from 'axios';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator';
import '../css/ProjectForm.scss';


class ProjectForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      description: '',
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
    axios.post(
      'http://localhost:8080/api/projects/add',
      JSON.stringify({
        project_name: this.state.name,
        project_description: this.state.description,
        project_id: 'ABC123',
        createdby_email: 'test-mail',
      }),
    )
      .then((res) => {
        console.log(res);
        // this.setState({ message: res });
        this.setState({ name: '', description: '' });
      })
      .catch((err) => {
        console.log(err);
        // this.setState({ message: err });
      });
  }

  render() {
    return (
      <Grid
        className="form-container"
      >
        {this.state.message}
        <ValidatorForm
          id="form-object"
          onSubmit={this.handleSubmit}
          autoComplete="off"
        >
          <TextValidator
            className="form-item form-control"
            id="name"
            name="name"
            label="Project name"
            value={this.state.name}
            onChange={this.handleChange}
            margin="normal"
            validators={['required']}
            errorMessages={['Name cannot be blank.']}
          />
          <TextValidator
            className="form-item form-control"
            id="description"
            name="description"
            label="Description"
            multiline
            rowsMax="8"
            value={this.state.description}
            onChange={this.handleChange}
            margin="normal"
            validators={['required']}
            errorMessages={['Description is mandatory.']}
          />
          <div className="form-item">
            <Button type="submit" id="submit-project" variant="raised" color="primary">
              <i className="material-icons margin-right">save</i> Save
            </Button>
          </div>
        </ValidatorForm>
      </Grid>
    );
  }
}

export default ProjectForm;
