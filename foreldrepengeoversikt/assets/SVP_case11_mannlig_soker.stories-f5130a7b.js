import{j as i}from"./index-dbb5eeba.js";import{A as t,s as a,a as p}from"./AppContainer-0640d843.js";import"./index-f1f749bf.js";import"./_commonjsHelpers-042e6b4d.js";import"./index-4d501b15.js";import"./index-96c5f47c.js";import"./extends-98964cd2.js";const l=[{arbeidsgiverId:"972674818",arbeidsgiverIdType:"orgnr",arbeidsgiverNavn:"PENGELØS SPAREBANK",stillingsprosent:100,fom:"2003-06-26"}],d={søker:{fnr:"23487701556",fornavn:"Effektiv",etternavn:"Prat",kjønn:"M",fødselsdato:"1977-08-23",bankkonto:{kontonummer:"",banknavn:""},sivilstand:{type:"UGIFT"}},arbeidsforhold:l},k=[],c=[],m={foreldrepenger:k,engangsstønad:[],svangerskapspenger:c},g=[],y=[],f=[],P={title:"SVP_case11_mannlig_soker.stories",component:t},v=()=>{const e=new a(p);return e.onGet("/sokerinfo").reply(200,d),e.onGet("/innsyn/v2/saker").reply(200,m),e.onGet("/dokument/alle").reply(200,g),e.onGet("/innsyn/tidslinje").reply(200,y),e.onGet("/historikk/vedlegg").reply(200,f),e.onGet("/minidialog").reply(200,[]),e.onPost("/soknad/ettersen").reply(200,{}),i(t,{})},n=v.bind({});var o,r,s;n.parameters={...n.parameters,docs:{...(o=n.parameters)==null?void 0:o.docs,source:{originalSource:`() => {
  const apiMock = new MockAdapter(AxiosInstance);
  apiMock.onGet('/sokerinfo').reply(200, søkerinfo);
  apiMock.onGet('/innsyn/v2/saker').reply(200, saker);
  apiMock.onGet('/dokument/alle').reply(200, dokumenter);
  apiMock.onGet('/innsyn/tidslinje').reply(200, tidslinjeHendelser);
  apiMock.onGet('/historikk/vedlegg').reply(200, manglendeVedlegg);
  apiMock.onGet('/minidialog').reply(200, []);
  apiMock.onPost('/soknad/ettersen').reply(200, {});
  return <AppContainer />;
}`,...(s=(r=n.parameters)==null?void 0:r.docs)==null?void 0:s.source}}};const x=["VisApp11"];export{n as VisApp11,x as __namedExportsOrder,P as default};
//# sourceMappingURL=SVP_case11_mannlig_soker.stories-f5130a7b.js.map
