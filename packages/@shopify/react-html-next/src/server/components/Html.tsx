import * as React from 'react';
import {renderToString} from 'react-dom/server';

import {Script, Style} from '../../components';
import Manager from '../../manager';

import Serialize from './Serialize';

export interface Asset {
  path: string;
  integrity?: string;
}

export interface Props {
  manager?: Manager;
  children: React.ReactNode;
  locale?: string;
  styles?: Asset[];
  scripts?: Asset[];
  blockingScripts?: Asset[];
  headMarkup?: React.ReactNode;
  bodyMarkup?: React.ReactNode;
}

export default function Html({
  manager,
  children,
  locale = 'en',
  blockingScripts = [],
  scripts = [],
  styles = [],
  headMarkup = null,
  bodyMarkup = null,
}: Props) {
  const markup = renderToString(children);

  const extracted = manager && manager.extract();

  const serializationMarkup = extracted
    ? extracted.serializations.map(({id, data}) => (
        <Serialize key={id} id={id} data={data} />
      ))
    : null;

  const titleMarkup = extracted ? <title>{extracted.title}</title> : null;
  const metaMarkup = extracted
    ? extracted.meta.map((metaProps, index) => (
        <meta key={index} {...metaProps} />
      ))
    : null;

  const linkMarkup = extracted
    ? extracted.links.map((linkProps, index) => (
        <link key={index} {...linkProps} />
      ))
    : null;

  const stylesMarkup = styles.map((style) => {
    return (
      <Style
        key={style.path}
        href={style.path}
        integrity={style.integrity}
        crossOrigin="anonymous"
      />
    );
  });

  const blockingScriptsMarkup = blockingScripts.map((script) => {
    return (
      <Script
        key={script.path}
        src={script.path}
        integrity={script.integrity}
        crossOrigin="anonymous"
      />
    );
  });

  const deferredScriptsMarkup = scripts.map((script) => {
    return (
      <Script
        key={script.path}
        src={script.path}
        integrity={script.integrity}
        crossOrigin="anonymous"
        defer
      />
    );
  });

  const bodyStyles =
    // eslint-disable-next-line no-process-env
    process.env.NODE_ENV === 'development' ? {display: 'none'} : undefined;

  return (
    <html lang={locale}>
      <head>
        {titleMarkup}
        {metaMarkup}
        {linkMarkup}

        {stylesMarkup}
        {headMarkup}
        {blockingScriptsMarkup}
      </head>

      <body style={bodyStyles}>
        <div id="app" dangerouslySetInnerHTML={{__html: markup}} />

        {bodyMarkup}
        {serializationMarkup}
        {deferredScriptsMarkup}
      </body>
    </html>
  );
}
