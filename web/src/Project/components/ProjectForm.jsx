import React from 'react';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import TextField from 'material-ui/TextField';
import '../css/ProjectForm.scss';

class ProjectForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      description: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    // const data = new FormData(event.target);
    // todo fetch
    this.setState({ name: '', description: '' });
  }

  render() {
    return (
      <Grid
        direction="column"
      >
        <form
          autoComplete="off"
          onSubmit={this.handleSubmit}
        >
          <TextField
            className="form-item"
            id="name"
            name="name"
            label="Project name"
            value={this.state.name}
            onChange={this.handleChange}
            margin="normal"
          />
          <TextField
            className="form-item"
            id="description"
            name="description"
            label="Description"
            multiline
            rows="4"
            value={this.state.description}
            onChange={this.handleChange}
            margin="normal"
          />
          <div className="form-item">
            <Button type="submit" variant="raised" color="primary">Save</Button>
          </div>
        </form>
      </Grid>
    );
  }
}

export default ProjectForm;
