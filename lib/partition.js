'use strict'

module.exports = genPartition

var code = 'for(var j=2*a,k=j*c,l=k,m=c,n=b,o=a+b,p=c;d>p;++p,k+=j){var _;if($)if(m===p)m+=1,l+=j;else{for(var s=0;j>s;++s){var t=e[k+s];e[k+s]=e[l],e[l++]=t}var u=f[p];f[p]=f[m],f[m++]=u}}return m'

function genPartition(name, predicate, args) {
  var fargs ='abcdef'.split('').concat(args)
  var reads = []
  if(predicate.indexOf('lo') >= 0) {
    reads.push('lo=e[k+n]')
  }
  if(predicate.indexOf('hi') >= 0) {
    reads.push('hi=e[k+o]')
  }
  var result = 'function '+name+'(' + fargs.join() + '){' + 
    code.replace('_', reads.join())
        .replace('$', predicate) + '}'
  return result
}

console.log(genPartition('partitionContainsHalfInterval', 'lo<=a0&&a1<=hi', ['a0', 'a1']))
console.log(genPartition('partitionContainsPoint', 'lo<=p0&&p0<=hi', ['p0']))
console.log(genPartition('partitionContainsPointProper', 'lo<p0&&p0<=hi', ['p0']))
console.log(genPartition('partitionStartLessThan', 'lo<p0', ['p0']))
console.log(genPartition('partitionStartLessThanEqual', 'lo<=p0', ['p0']))
console.log(genPartition('partitionEndLessThan', 'hi<p0', ['p0']))
