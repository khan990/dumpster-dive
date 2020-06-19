<div align="center">
	<h3>dumpster-dive</h3>
	<a href="https://npmjs.org/package/dumpster-dive">
		<img src="https://img.shields.io/npm/v/dumpster-dive.svg?style=flat-square" />
	</a>
  <a href="https://www.codacy.com/app/spencerkelly86/dumpster-dive">
    <img src="https://api.codacy.com/project/badge/grade/6fad3c588d3d4c97ab8a9abf9f2a5a01" />
  </a>
	<div>wikipedia dump parser</div>
  <sub>
    by
    <a href="http://spencermounta.in/">Spencer Kelly</a>, <a href="https://github.com/devrim">Devrim Yasar</a>,
		 and
    <a href="https://github.com/spencermountain/wtf_wikipedia/graphs/contributors">
      others
    </a>
  </sub>
</div>
<p></p>

<div align="center">
  gets a wikipedia <a href="https://dumps.wikimedia.org">xml dump</a> into mongo,
  <div>so you can mess-around.</div>

  <h2 align="center">💂 Yup 💂</h2>
  <div><sup>do it on your laptop.</sup></div>
	<img src="https://user-images.githubusercontent.com/399657/39391259-b57ca9e0-4a6e-11e8-8b33-2064e5fc187e.png"/>
</div>

`dumpster-dive` is a **nodejs** script that puts a **highly-queryable** wikipedia on your computer in a nice afternoon.

It uses [worker-nodes](https://github.com/allegro/node-worker-nodes) to process pages in parallel, and [wtf_wikipedia](https://github.com/spencermountain/wtf_wikipedia) to turn ***wikiscript*** into whatever json.

<div align="center">
 -- <b>en-wikipedia</b> takes about 5-hours, end-to-end --
</div>

![dumpster](https://user-images.githubusercontent.com/399657/40262198-a268b95a-5ad3-11e8-86ef-29c2347eec81.gif)

```bash
npm install -g dumpster-dive
```
### 😎 API
```js
var dumpster = require('dumpster-dive')
dumpster({ file:'./enwiki-latest-pages-articles.xml', db:'enwiki'}, callback)
```

### Command-Line:
```bash
dumpster /path/to/my-wikipedia-article-dump.xml --citations=false --html=true
```

*then check out the articles in mongo:*
````bash
$ mongo        #enter the mongo shell
use enwiki     #grab the database
db.pages.count()
# 4,926,056...
db.pages.find({title:"Toronto"})[0].categories
#[ "Former colonial capitals in Canada",
#  "Populated places established in 1793" ...]
````

# Steps:

### 1️⃣ you can do this.
you can do this.
just a few Gb. you can do this.

### 2️⃣ get ready
Install [nodejs](https://nodejs.org/en/) (at least `v6`), [mongodb](https://docs.mongodb.com/manual/installation/) (at least `v3`)

```bash
# install this script
npm install -g dumpster-dive # (that gives you the global command `dumpster`)
# start mongo up
mongod --config /mypath/to/mongod.conf
```

### 3️⃣ download a wikipedia
The Afrikaans wikipedia (around 47,000 articles) only takes a few minutes to download, and 5 mins to load into mongo on a macbook:
```bash
# dowload an xml dump (38mb, couple minutes)
wget https://dumps.wikimedia.org/afwiki/latest/afwiki-latest-pages-articles.xml.bz2
```
the english dump is 16Gb. The [download page](https://dumps.wikimedia.org/enwiki/latest/) is confusing, but you'll want this file: `${LANG}wiki-latest-pages-articles.xml.bz2 `

### 4️⃣ unzip it
i know, this sucks. but it makes the parser so much faster.
```
bzip2 -d ~/path/afwiki-latest-pages-articles.xml.bz2
```
On a macbook, unzipping en-wikipedia takes an hour or so. This is the most-boring part. Eat some lunch.

The english wikipedia is around 60Gb.

### 5️⃣ OK, start it off
```bash
#load it into mongo (10-15 minutes)
dumpster ./afwiki-latest-pages-articles.xml
```
### 6️⃣ take a bath
just put some [epsom salts](https://www.youtube.com/watch?v=QSlIHCu2Smw) in there, it feels great.

The en-wiki dump should take a few hours. Maybe 8. Should be done before dinner.

The console will update you every couple seconds to let you know where it's at.

### 7️⃣ done!
![image](https://user-images.githubusercontent.com/399657/40262181-7c1f17bc-5ad3-11e8-95ab-55f324022d43.png)

go check-out the data! to view your data in the mongo console:

```js
$ mongo
use afwiki //your db name

//show a random page
db.pages.find().skip(200).limit(2)

//find a specific page
db.pages.findOne({title:"Toronto"}).categories

//find the last page
db.pages.find().sort({$natural:-1}).limit(1)

// all the governors of Kentucky
db.pages.count({ categories : { $eq : "Governors of Kentucky" }}

//pages without images
db.pages.count({ images: {$size: 0} })
```

alternatively, you can run `dumpster-report afwiki` to see a quick spot-check of the records it has created across the database.

### Same for the English wikipedia:
the english wikipedia will work under the same process, but
the download will take an afternoon, and the loading/parsing a couple hours. The en wikipedia dump is a 13 GB (for [enwiki-20170901-pages-articles.xml.bz2](https://dumps.wikimedia.org/enwiki/20170901/enwiki-20170901-pages-articles.xml.bz2)), and becomes a pretty legit mongo collection uncompressed. It's something like 51GB, but mongo can do it 💪.

### Options:
dumpster follows all the conventions of [wtf_wikipedia](https://github.com/spencermountain/wtf_wikipedia), and you can pass-in any fields for it to include in it's json.
* **human-readable plaintext** ***--plaintext***
```js
dumpster({file:'./myfile.xml.bz2', db: 'enwiki', plaintext:true, categories:false})
/*
[{
  _id:'Toronto',
  title:'Toronto',
  plaintext:'Toronto is the most populous city in Canada and the provincial capital...'
}]
*/
```

* **disambiguation pages /  redirects** ***--skip_disambig***, ***--skip_redirects***
by default, dumpster skips entries in the dump that aren't full-on articles, you can
```js
let obj = {
	file: './path/enwiki-latest-pages-articles.xml.bz2',
	db: 'enwiki',
	skip_redirects: false,
	skip_disambig: false
}
dumpster(obj, () => console.log('done!') )
```

* **reducing file-size:**
you can tell wtf_wikipedia what you want it to parse, and which data you don't need:
```bash
dumpster ./my-wiki-dump.xml --infoboxes=false --citations=false --categories=false --links=false
```
* **custom json formatting**
you can grab whatever data you want, by passing-in a `custom` function. It takes a [wtf_wikipedia](https://github.com/spencermountain/wtf_wikipedia) `Doc` object, and you can return your cool data:
```js
let obj={
	file: path,
	db: dbName,
	custom: function(doc) {
		return {
			_id: doc.title(),   //for duplicate-detection
			title: doc.title(), //for the logger..
			sections: doc.sections().map(i => i.json({encode:true})),
			categories: doc.categories() //whatever you want!
		}
	}
}
dumpster(obj, () => console.log('custom wikipedia!') )
```
if you're using any `.json()` methods, pass a `{encode:true}` in to avoid mongo complaints about key-names.

* **non-main namespaces:**
do you want to parse all the navboxes? change `namespace` in ./config.js to [another number](https://en.wikipedia.org/wiki/Wikipedia:Namespace)

## how it works:
this library uses:
* [sunday-driver](https://github.com/spencermountain/sunday-driver) to stream the gnarly xml file
* [wtf_wikipedia](https://github.com/spencermountain/wtf_wikipedia) to brute-parse the article wikiscript contents into JSON.

## Addendum:
### \_ids
since wikimedia makes all pages have globally unique titles, we also use them for the mongo `_id` fields.
The benefit is that if it crashes half-way through, or if you want to run it again, running this script repeatedly will not multiply your data. We do a 'upsert' on the record.

### encoding special characters
mongo has some opinions on special-characters in some of its data. It is weird, but we're using this [standard(ish)](https://stackoverflow.com/a/30254815/168877) form of encoding them:
```
\  -->  \\
$  -->  \u0024
.  -->  \u002e
```
### Non-wikipedias
This library should also work on other wikis with standard xml dumps from [MediaWiki](https://www.mediawiki.org/wiki/MediaWiki) (except wikidata!). I haven't tested them, but the wtf_wikipedia supports all sorts of non-standard wiktionary/wikivoyage templates, and if you can get a bz-compressed xml dump from your wiki, this should work fine. Open an issue if you find something weird.

### did it break?
if the script trips at a specific spot, it's helpful to know the article it breaks on, by setting `verbose:true`:
```js
dumpster({
  file: '/path/to/file.xml',
  verbose: true
})
```
this prints out every page's title while processing it..

### 16mb limit?
To go faster, this library writes a ton of articles at a time (default 800). Mongo has a **16mb** limit on writes, so if you're adding a bunch of data, like `latex`, or `html`, it may make sense to turn this down.
```
dumpster --batch_size=100
```
that should do the trick.

### PRs welcome!
This is an important project, come [help us out](./contributing.md).











# Dumpster

This project was generated using [Nx](https://nx.dev).

<p align="center"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="450"></p>

🔎 **Nx is a set of Extensible Dev Tools for Monorepos.**

## Quick Start & Documentation

[Nx Documentation](https://nx.dev/angular)

[10-minute video showing all Nx features](https://nx.dev/angular/getting-started/what-is-nx)

[Interactive Tutorial](https://nx.dev/angular/tutorial/01-create-application)

## Adding capabilities to your workspace

Nx supports many plugins which add capabilities for developing different types of applications and different tools.

These capabilities include generating applications, libraries, etc as well as the devtools to test, and build projects as well.

Below are our core plugins:

- [Angular](https://angular.io)
  - `ng add @nrwl/angular`
- [React](https://reactjs.org)
  - `ng add @nrwl/react`
- Web (no framework frontends)
  - `ng add @nrwl/web`
- [Nest](https://nestjs.com)
  - `ng add @nrwl/nest`
- [Express](https://expressjs.com)
  - `ng add @nrwl/express`
- [Node](https://nodejs.org)
  - `ng add @nrwl/node`

There are also many [community plugins](https://nx.dev/nx-community) you could add.

## Generate an application

Run `ng g @nrwl/angular:app my-app` to generate an application.

> You can use any of the plugins above to generate applications as well.

When using Nx, you can create multiple applications and libraries in the same workspace.

## Generate a library

Run `ng g @nrwl/angular:lib my-lib` to generate a library.

> You can also use any of the plugins above to generate libraries as well.

Libraries are sharable across libraries and applications. They can be imported from `@dumpster/mylib`.

## Development server

Run `ng serve my-app` for a dev server. Navigate to http://localhost:4200/. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng g component my-component --project=my-app` to generate a new component.

## Build

Run `ng build my-app` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test my-app` to execute the unit tests via [Jest](https://jestjs.io).

Run `nx affected:test` to execute the unit tests affected by a change.

## Running end-to-end tests

Run `ng e2e my-app` to execute the end-to-end tests via [Cypress](https://www.cypress.io).

Run `nx affected:e2e` to execute the end-to-end tests affected by a change.

## Understand your workspace

Run `nx dep-graph` to see a diagram of the dependencies of your projects.

## Further help

Visit the [Nx Documentation](https://nx.dev/angular) to learn more.

## ☁ Nx Cloud

### Computation Memoization in the Cloud

<p align="center"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-cloud-card.png"></p>

Nx Cloud pairs with Nx in order to enable you to build and test code more rapidly, by up to 10 times. Even teams that are new to Nx can connect to Nx Cloud and start saving time instantly.

Teams using Nx gain the advantage of building full-stack applications with their preferred framework alongside Nx’s advanced code generation and project dependency graph, plus a unified experience for both frontend and backend developers.

Visit [Nx Cloud](https://nx.app/) to learn more.
