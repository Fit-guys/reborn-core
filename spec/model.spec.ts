import * as sinon from 'sinon';
import { expect, assert } from "chai";
import * as mocks from 'node-mocks-http';
import { Example } from '../src/models/example.model';
import { after } from 'mocha';
import config from "../src/config/config";
var mongoose = require('mongoose');

