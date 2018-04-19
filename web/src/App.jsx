import React from 'react';
import Grid from 'material-ui/Grid';
import { Route, Switch } from 'react-router-dom';
import Header from './common/components/Header';
import Sidebar from './common/components/Sidebar';
import Home from './Home/components/Home';
import ProjectList from './Project/components/ProjectList';
import Project from './Project/components/Project';
import CreateProject from './Project/components/CreateProject';
import NotFound from './common/components/NotFound';
import '../dist/fonts/fonts.css';
import './common/css/main.scss';

class App extends React.Component {
  render() {
    return (
      <div>
        <Header />
        <Grid container spacing={16}>
          <Grid item sm={3}>
            <Sidebar />
          </Grid>
          <Grid item sm={9}>
            <div className="content-container">
              <Switch>
                <Route exact path="/" component={Home} />
                <Route path="/projects/new" component={CreateProject} />
                <Route exact path="/projects" component={ProjectList} />
                <Route path="/projects/:id" component={Project} />
                <Route exact path="*" component={NotFound} />
              </Switch>
            </div>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default App;
