  /**
  * Componium.js a work-in-progress react.js alternative
  *
  * Store function
  * @key String = Component reference name
  * @value Component {Object} instance
  * 
  * Random function
  * @length Integer = Length of random String
  * <returns> |String|
  *
  * View function
  * @setter {Object}.parent = |String| Parent component reference name
  *                           {document.body} is default parent node
  *         {Object}.node   = {HTML Node} to append to Parent
  *
  * Config function
  * @data {Object}.classnames = [Array@String] of class names for node
  *       {Object}.content    = |String| Node innerHTML
  *       {Object}.other      = {Object} @key   = |String| HTML node attribute name
  *                                      @value = |String| attribute value
  *       {Object}.name       = |String| Component reference name, only needed if @node is false
  * @node {HTML Node}         = HTML node to configure
  *
  * 
  * Node function
  * @data {Object}.name       = |String| Component reference name
  *       {Object}.content    = |String| Node innerHTML
  *       {Object}.other      = {Object} @key   = |String| HTML node attribute name
  *                                      @value = |String| attribute value
  *       {Object}.classnames = [Array@String] of class names for node
  *       {Object}.type       = |String| any HTML node type. Example "div", "p", "h1" et al
  * 
  * Style function
  * @data      {Object} @key   = |String| CSS style attribute name, in camelCase format
  *                     @value = |String| attribute value
  * @multiple  [Array@String]  = Component reference names to apply styles to
  * 
  * Info function
  * @data {Object}.name       = Component reference name
  *       {Object}.dimensions <returns> [Array@Integer{width, height}] 
  *       {Object}.position   <returns> [Array@Integer{x, y}] 
  * <returns> undefined
  *
  */

const Componium = (function() {
  "use strict";
  
  function Componium(id) {
    this.id    = id;
    this.store = Object.create(null);
  }
  const proto = {
    store    : Object.create(null),
    random   : Object.freeze(function(length) {
      let l = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNPQRSTUVWXYZ';
      let c = '';
      for (let i = 0; i < length; i++) {
        c += l.charAt(Math.round(Math.random() * 51));
      }
      return c;
    }),
    create   : Object.freeze(function(name) {
      const id = Componium.prototype.random(12);
      Componium.prototype.store[name] = new Componium(id);
      return id;
    }),
    view     : {
      set add(data) {
        if (data.parent) {
          const parent = document.getElementById(Componium.prototype.store[data.parent].id);
          void parent.appendChild(data.node);
        }
        else {
          void this.body.appendChild(data.node);
        }
      },
      body: Object.freeze(document.body),
      dom : Object.freeze(document.createDocumentFragment()),
    },
    element  : Object.freeze(function(data) {
      const nodeid = Componium.prototype.create(data.name);
      const node   = document.createElement(data.type);
      void node.setAttribute("id", nodeid);
      void Componium.prototype.config(Object.freeze(data), node);
      return node;
    }),
    build    : Object.freeze(function(data, parent) {
      if (!parent) {
        let nodes = [];
        for (let entry of data)  void nodes.push(Componium.prototype.element(entry));
        parent = nodes[0];
        while (nodes.length > 1) void nodes[nodes.length - 2].appendChild(nodes.pop());
        Componium.prototype.view.add = {node: parent};
      }
      else {
        const node = document.getElementById(Componium.prototype.store[parent].id);
        for (let i = 0; i < data.length; i++) {
          void node.appendChild(Componium.prototype.element(data[i]));
        }
      }
    }),
    bulk     : Object.freeze(function(data, parent) {
      let node = document.getElementById(Componium.prototype.store[parent].id);
      let vdom = Componium.prototype.view.dom;
      for (let i = 0; i < data.length; i++) void vdom.append(Componium.prototype.element(data[i]));  
      return void node.appendChild(vdom);
    }),
    config   : Object.freeze(function(data, node) {
      if (!node)           {
        if (!data.name) return;
        node = document.getElementById(Componium.prototype.store[data.name].id);
      }
      if (data.classnames) {
        void node.setAttribute("class", data.classnames.join(" "));
      }
      if (data.content)    {
        if (typeof data.content === 'object') {
          node.appendChild(data.content);
        }
        else {
          node.innerHTML = data.content;
        }
      }
      if (data.other)      {
        Object.keys(data.other).forEach(attribute => void node.setAttribute(attribute, data.other[attribute]));
      }
      return;
    }),
    node     : Object.freeze(function(data) {
      const node = Componium.prototype.element(data);
      if (data.parent) Componium.prototype.view.add = {node: node, parent: data.parent};
      else Componium.prototype.view.add = {node: node};
    }),
    event    : Object.freeze(function(data) {
      const comp    = Componium.prototype.store[data.name];
      const node    = document.getElementById(comp.id);
      const eventid = Componium.prototype.random(12);
      
      comp.store[data.event]       = eventid;
      Componium.prototype[eventid] = data.fn.bind(comp);
      node[data.event]             = Componium.prototype[eventid];
      
    }),
    style    : Object.freeze(function(data, multiple) {
      if (!multiple) {
        const node = document.getElementById(this.id);
        Object.keys(data).forEach(style => {
          node.style[style] = data[style];
        });
      }
      else {
        multiple.forEach(name => {
          const node = document.getElementById(Componium.prototype.store[name].id);
          Object.keys(data).forEach(style => {
            node.style[style] = data[style];
          });
        });
      }
    }),
    styleAll : Object.freeze(function(data) {
      if (!data) {
        Componium.prototype.view.add = {node:Componium.prototype.element({name: "globalstyle",type: "style"})};
      }
      else {
        const sheet = document.getElementById(Componium.prototype.store.globalstyle.id);
        if (data.append) sheet.innerText += data.style;
        else sheet.innerText = data.style;
      }
    }),
    info     : Object.freeze(function(data) {
      if (!data.name) return;
      
      const node = document.getElementById(Componium.prototype.store[data.name].id);
      
      if (data.dimensions) return [node.clientWidth, node.clientHeight];
      if (data.position)   return [node.offsetLeft, node.offsetTop];
      
      return;
    }),
    group    : Object.freeze(function(data) {
      if (!Componium.prototype.store.groups) {
        Componium.prototype.store.groups = Object.create(null);
      }
      Componium.prototype.store.groups[data.name] = Object.freeze(data.components);
      return;
    }),
  };
  Componium.prototype = proto;
  return Object.freeze(Componium);
})();
