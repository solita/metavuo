import React from 'react';
import ReactDOM from 'react-dom';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Header from './common/components/Header';
import CreateProject from './Project/components/CreateProject';
import '../dist/fonts/fonts.css';
import './common/css/main.scss';

ReactDOM.render(
  <div>
    <Header />
    <Grid container spacing={16}>
      <Grid item sm={3}>
        <Typography variant="body2" color="inherit">
          Sivumenu
        </Typography>
      </Grid>
      <Grid item sm={9}>
        <CreateProject />
      </Grid>
    </Grid>
  </div>,
  document.getElementById('root'),
);
