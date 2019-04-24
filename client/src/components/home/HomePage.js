import React, { Component } from "react";
import { Button, Container, Header, Icon } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { Z_BLOCK } from "zlib";
class HomePage extends Component {
  render() {
    let bigFont = { fontSize: "3em" };
    return (
      <div style={bigFont}>
        <Container text>
          <Header
            as="h1"
            content="Welcome to Lernt.io"
            style={{
              fontSize: "4em",
              marginTop: "2em"
            }}
          />
          <Header
            as="h2"
            color="grey"
            content="What do you want to learn?"
            style={{
              fontSize: "1.7em",
              fontWeight: "normal",
              marginTop: "1em"
            }}
          />
        </Container>

        <div
          class="ui stackable grid"
          style={{
            fontSize: "1em",
            fontWeight: "normal",
            marginTop: "1em"
          }}
        >
          <div class="eight wide tablet four wide computer column">
            <div class="ui fluid card">
              <div class="content">
                <h3 class="ui center aligned header">
                  <a href="frontend.html">Front-End Dev</a>
                </h3>
              </div>
              <div class="icon">
                <i class="html5 icon" />
                <i class="css3 icon" />
                <i class="js icon" />
                <i class="react icon" />
              </div>
            </div>
          </div>
          <div class="eight wide tablet four wide computer column">
            <div class="ui fluid card">
              <div class="content">
                <h3 class="ui center aligned header">
                  <a href="backend.html">Back-End Dev</a>
                </h3>
              </div>
              <div class="icon">
                <i class="node icon" />
              </div>
            </div>
          </div>
          <div class="eight wide tablet four wide computer column">
            <div class="ui fluid card">
              <div class="content">
                <h3 class="ui center aligned header">
                  <a href="android.html">Android Dev</a>
                </h3>
              </div>
              <div class="icon">
                <i class="android icon" />
              </div>
            </div>
          </div>
          <div class="eight wide tablet four wide computer column">
            <div class="ui fluid card">
              <div class="content">
                <h3 class="ui center aligned header">
                  <a href="ios.html">iOS Dev</a>
                </h3>
              </div>
              <div class="icon">
                <i class="apple icon" />
              </div>
            </div>
          </div>
        </div>
        <div class="home-button">
          <Button
            as={Link}
            to="/login"
            color="yellow"
            size="huge"
            style={{
              marginTop: "2em"
            }}
          >
            I'd like to receive my custom Learning Path
            <Icon name="right arrow" />
          </Button>
        </div>
      </div>
    );
  }
}

export default HomePage;
