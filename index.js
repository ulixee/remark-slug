'use strict'

var toString = require('mdast-util-to-string')
var visit = require('unist-util-visit')
var slugs = require('github-slugger')()

module.exports = slug

function slug() {
  return transformer
}

// Patch slugs on heading nodes.
function transformer(ast) {
  slugs.reset()

  visit(ast, 'heading', visitor)

  function visitor(node) {
    checkForHeaderId(node);
    var data = node.data || (node.data = {})
    var props = data.hProperties || (data.hProperties = {})
    var id = props.id

    console.log('building slug', id)

    id = id ? slugs.slug(id, true) : slugs.slug(toString(node))

    data.id = id
    props.id = id
  }
}

function checkForHeaderId(node) {
  let lastChild = node.children[node.children.length - 1]
  if (lastChild && lastChild.type === 'text') {
    let string = lastChild.value.replace(/ +$/, '')
    let matched = string.match(/ {#([^]+?)}$/)

    if (matched) {
      let id = matched[1]
      if (!!id.length) {
        if (!node.data) {
          node.data = {}
        }
        if (!node.data.hProperties) {
          node.data.hProperties = {}
        }
        node.data.id = node.data.hProperties.id = id

        string = string.substring(0, matched.index)
        lastChild.value = string
      }
    }
  }
}
