'use strict';

/**
 * datasheet service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::datasheet.datasheet');
